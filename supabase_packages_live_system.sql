-- ==============================================================================
-- منصة الجُنيدي التعليمية - ترقية نظام باقات الطلاب (باقات باللايف وباقات بدون لايف)
-- ==============================================================================

-- 1. إضافة أعمدة نوع الباقة وصلاحية البث المباشر في جدول المستخدمين (profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS has_live BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS live_minutes_balance INT DEFAULT 0;

-- 2. تحديث السجلات القديمة: الطلاب الذين لديهم اشتراك سارٍ مسبقاً
-- نحدد نوع الباقة الافتراضي لهم كـ 'student_basic' مع إمكانية ترقيتهم للأدمن
UPDATE public.profiles
SET plan_type = 'student_basic'
WHERE role = 'student' 
  AND status = 'approved' 
  AND subscription_end_date IS NOT NULL 
  AND subscription_end_date > now()
  AND (plan_type IS NULL OR plan_type = 'free');

-- 3. دالة RPC لتحديث باقة الطالب من لوحة الأدمن بشكل آمن ومباشر
CREATE OR REPLACE FUNCTION public.admin_set_student_package(
    p_student_id UUID,
    p_plan_type VARCHAR(50),
    p_has_live BOOLEAN,
    p_duration_months INT DEFAULT 1,
    p_bonus_credits INT DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base_date TIMESTAMP WITH TIME ZONE;
    v_new_end_date TIMESTAMP WITH TIME ZONE;
    v_current_end TIMESTAMP WITH TIME ZONE;
    v_current_credits NUMERIC(10, 2);
    v_new_credits NUMERIC(10, 2);
BEGIN
    SELECT subscription_end_date, COALESCE(ai_credits_balance, 20.00)
    INTO v_current_end, v_current_credits
    FROM public.profiles
    WHERE id = p_student_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'الطالب غير موجود.');
    END IF;

    IF v_current_end IS NOT NULL AND v_current_end > now() THEN
        v_base_date := v_current_end;
    ELSE
        v_base_date := now();
    END IF;

    v_new_end_date := v_base_date + (p_duration_months * INTERVAL '1 month');
    v_new_credits := v_current_credits + COALESCE(p_bonus_credits, 0);

    UPDATE public.profiles
    SET status = 'approved',
        plan_type = p_plan_type,
        has_live = p_has_live,
        subscription_end_date = v_new_end_date,
        ai_credits_balance = v_new_credits
    WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'plan_type', p_plan_type,
        'has_live', p_has_live,
        'subscription_end_date', v_new_end_date,
        'new_credits', v_new_credits,
        'message', 'تم تحديث باقة الطالب وصلاحيات البث المباشر بنجاح!'
    );
END;
$$;

-- 4. تحديث دالة استبدال الأكواد (redeem_activation_code) لتسجيل نوع الباقة وصلاحية اللايف
CREATE OR REPLACE FUNCTION public.redeem_activation_code(p_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_code_record RECORD;
    v_current_end TIMESTAMP WITH TIME ZONE;
    v_base_date TIMESTAMP WITH TIME ZONE;
    v_new_end_date TIMESTAMP WITH TIME ZONE;
    v_cleaned_code TEXT;
    v_current_credits NUMERIC(10, 2);
    v_new_credits NUMERIC(10, 2);
    v_added_credits NUMERIC(10, 2);
    v_plan_title TEXT;
    v_plan_type TEXT;
    v_has_live BOOLEAN;
    v_msg TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً لتفعيل الكود.');
    END IF;

    v_cleaned_code := trim(p_code);
    IF v_cleaned_code IS NULL OR v_cleaned_code = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'يرجى إدخال كود التفعيل.');
    END IF;

    SELECT * INTO v_code_record
    FROM public.activation_codes
    WHERE upper(code) = upper(v_cleaned_code) AND is_used = false
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'الكود غير صحيح أو تم استخدامه مسبقاً.');
    END IF;

    SELECT subscription_end_date, COALESCE(ai_credits_balance, 20.00)
    INTO v_current_end, v_current_credits
    FROM public.profiles
    WHERE id = v_user_id;

    v_added_credits := COALESCE(v_code_record.ai_credits, 0);
    v_new_credits := v_current_credits + v_added_credits;
    v_plan_title := COALESCE(v_code_record.plan_name, 'الباقة');
    v_plan_type := COALESCE(v_code_record.plan_type, 'student_basic');
    v_has_live := (v_plan_type = 'student_vip' OR v_plan_type = 'teacher_pro' OR COALESCE(v_code_record.live_minutes, 0) > 0);

    -- حالة كارت شحن رصيد ذكاء فقط
    IF v_plan_type = 'ai_credits' OR (v_code_record.duration_months = 0 AND v_added_credits > 0) THEN
        UPDATE public.profiles
        SET ai_credits_balance = v_new_credits
        WHERE id = v_user_id;

        INSERT INTO ai_credits_ledger (user_id, amount, balance_after, action_type, description)
        VALUES (v_user_id, v_added_credits, v_new_credits, 'recharge_card', 'شحن كارت رصيد ذكاء اصطناعي: ' || v_cleaned_code);

        UPDATE public.activation_codes
        SET is_used = true, used_by = v_user_id, used_at = now()
        WHERE id = v_code_record.id;

        RETURN jsonb_build_object(
            'success', true,
            'is_credit_only', true,
            'added_credits', v_added_credits,
            'new_credits_balance', v_new_credits,
            'message', format('تم شحن %s كريديت ذكاء اصطناعي بنجاح! 💎 رصيدك الحالي: %s كريديت.', v_added_credits, v_new_credits)
        );
    END IF;

    -- حالة باقات الاشتراك (شهري / ترم / سنة)
    IF v_current_end IS NOT NULL AND v_current_end > now() THEN
        v_base_date := v_current_end;
    ELSE
        v_base_date := now();
    END IF;

    v_new_end_date := v_base_date + (COALESCE(v_code_record.duration_months, 1) * INTERVAL '1 month');

    UPDATE public.profiles
    SET status = 'approved',
        plan_type = v_plan_type,
        has_live = v_has_live,
        subscription_end_date = v_new_end_date,
        ai_credits_balance = v_new_credits,
        role = CASE 
            WHEN v_plan_type = 'teacher_pro' THEN 'teacher_pro'
            WHEN v_plan_type = 'teacher_basic' THEN 'teacher'
            ELSE role 
        END,
        live_minutes_balance = CASE 
            WHEN COALESCE(v_code_record.live_minutes, 0) > 0 THEN COALESCE(live_minutes_balance, 0) + v_code_record.live_minutes
            ELSE live_minutes_balance
        END
    WHERE id = v_user_id;

    IF v_added_credits > 0 THEN
        INSERT INTO ai_credits_ledger (user_id, amount, balance_after, action_type, description)
        VALUES (v_user_id, v_added_credits, v_new_credits, 'subscription_bonus', 'رصيد إضافي هدية مع كود اشتراك: ' || v_plan_title);
    END IF;

    UPDATE public.activation_codes
    SET is_used = true, used_by = v_user_id, used_at = now()
    WHERE id = v_code_record.id;

    v_msg := format('تم تفعيل (%s) بنجاح لمدة %s شهر!', v_plan_title, v_code_record.duration_months);
    IF v_has_live THEN
        v_msg := v_msg || ' ومفعل لك البث المباشر 🔴';
    END IF;
    IF v_added_credits > 0 THEN
        v_msg := v_msg || format(' مع %s كريديت AI هدية 💎', v_added_credits);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'plan_name', v_plan_title,
        'plan_type', v_plan_type,
        'has_live', v_has_live,
        'duration_months', v_code_record.duration_months,
        'subscription_end_date', v_new_end_date,
        'added_credits', v_added_credits,
        'new_credits_balance', v_new_credits,
        'message', v_msg
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_student_package(UUID, VARCHAR, BOOLEAN, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(TEXT) TO authenticated;
