-- ==============================================================================
-- منصة الجُنيدي التعليمية - نظام حماية واحتساب رصيد الذكاء الاصطناعي (AI Credits System)
-- يدعم احتساب التوكنز بدقة (1 كريديت = 1,000 توكن - يدعم الكسور العشرية بدقة)
-- ==============================================================================

-- 1. إضافة أو ترقية حقل رصيد الكريديتس في جدول المستخدمين (profiles) ليدعم الكسور العشرية
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_credits_balance NUMERIC(10, 2) DEFAULT 20.00;

-- في حال كان الحقل موجوداً مسبقاً بنوع INT، نحوله إلى NUMERIC(10, 2)
DO $$
BEGIN
    ALTER TABLE profiles ALTER COLUMN ai_credits_balance TYPE NUMERIC(10, 2);
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- تحديث السجلات القديمة التي قد تكون NULL لتصبح 20 كريديت تلقائياً
UPDATE profiles 
SET ai_credits_balance = 20.00 
WHERE ai_credits_balance IS NULL;

-- 2. جدول سجل المعاملات والاستهلاك (Ledger) للشفافية وتتبع العمليات ومنع التلاعب
CREATE TABLE IF NOT EXISTS ai_credits_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL, -- قيمة سالبة للخصم (مثال: -0.25)، وموجبة للشحن (مثال: +100)
    balance_after NUMERIC(10, 2) NOT NULL,
    action_type TEXT NOT NULL, -- نوع العملية: student_ai_chat, exam_builder, quiz_generator, topup
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- في حال كان الجدول موجوداً مسبقاً بنوع INT، نرقي الأعمدة
DO $$
BEGIN
    ALTER TABLE ai_credits_ledger ALTER COLUMN amount TYPE NUMERIC(10, 2);
    ALTER TABLE ai_credits_ledger ALTER COLUMN balance_after TYPE NUMERIC(10, 2);
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- فهرس لتسريع استعلامات سجل المعاملات
CREATE INDEX IF NOT EXISTS idx_ai_credits_ledger_user ON ai_credits_ledger(user_id);

-- تفعيل حماية RLS لجدول السجل
ALTER TABLE ai_credits_ledger ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدم بقراءة سجل استهلاكه فقط
DROP POLICY IF EXISTS "Users can view their own AI credit logs" ON ai_credits_ledger;
CREATE POLICY "Users can view their own AI credit logs" 
ON ai_credits_ledger FOR SELECT 
USING (auth.uid() = user_id);

-- 3. دالة الخصم الآمنة والمحمية (Atomic Deduction RPC - SECURITY DEFINER)
-- تدعم الخصم العشري بالتوكنز بدقة متناهية (مثال: خصم 0.15 كريديت لسؤال 150 توكن)
CREATE OR REPLACE FUNCTION deduct_ai_credits(
    p_user_id UUID,
    p_amount NUMERIC,
    p_action TEXT DEFAULT 'ai_generation'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC(10, 2);
    v_new_balance NUMERIC(10, 2);
    v_role TEXT;
BEGIN
    -- قفل السجل لحظياً لمنع هجمات التكرار والسباق (Race Condition)
    SELECT ai_credits_balance, role INTO v_current_balance, v_role
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'user_not_found', 
            'message', 'المستخدم غير مسجل بالنظام.'
        );
    END IF;

    -- المديرون (Admin) لا ينفد رصيدهم لضمان سهولة الإدارة
    IF v_role = 'admin' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'remaining_credits', COALESCE(v_current_balance, 9999), 
            'is_admin', true
        );
    END IF;

    v_current_balance := COALESCE(v_current_balance, 20.00);

    -- التحقق من كفاية الرصيد
    IF v_current_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'insufficient_credits', 
            'current_balance', v_current_balance,
            'required', p_amount,
            'message', 'رصيد الذكاء الاصطناعي غير كافٍ. رصيدك الحالي: ' || v_current_balance || ' كريديت والمطلوب: ' || p_amount || ' كريديت. يرجى الشحن للمتابعة.'
        );
    END IF;

    v_new_balance := ROUND(v_current_balance - p_amount, 2);

    -- الخصم من الرصيد
    UPDATE profiles
    SET ai_credits_balance = v_new_balance
    WHERE id = p_user_id;

    -- توثيق العملية في السجل
    INSERT INTO ai_credits_ledger (user_id, amount, balance_after, action_type, description)
    VALUES (p_user_id, -ROUND(p_amount, 2), v_new_balance, p_action, 'خصم استهلاك ميزات الذكاء الاصطناعي (توكنز)');

    RETURN jsonb_build_object(
        'success', true, 
        'remaining_credits', v_new_balance, 
        'deducted', ROUND(p_amount, 2)
    );
END;
$$;

-- 4. دالة شحن وإضافة الرصيد الآمنة (Top-up RPC)
CREATE OR REPLACE FUNCTION topup_ai_credits(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT DEFAULT 'شحن باقة رصيد ذكاء اصطناعي'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC(10, 2);
    v_new_balance NUMERIC(10, 2);
BEGIN
    SELECT ai_credits_balance INTO v_current_balance
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
    END IF;

    v_current_balance := COALESCE(v_current_balance, 0.00);
    v_new_balance := ROUND(v_current_balance + p_amount, 2);

    UPDATE profiles
    SET ai_credits_balance = v_new_balance
    WHERE id = p_user_id;

    INSERT INTO ai_credits_ledger (user_id, amount, balance_after, action_type, description)
    VALUES (p_user_id, ROUND(p_amount, 2), v_new_balance, 'topup', p_description);

    RETURN jsonb_build_object(
        'success', true, 
        'new_balance', v_new_balance, 
        'added', ROUND(p_amount, 2)
    );
END;
$$;
