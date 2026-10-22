-- =======================================================
-- ملف الإصلاحات الأمنية الشاملة لمنصة الوتين التعليمية
-- 1. تأمين كروت الشحن وأكواد التفعيل
-- 2. إنشاء دالة RPC الآمنة لتفعيل الكروت
-- =======================================================

-- 1. التأكد من وجود الجدول وتفعيل الـ RLS
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    duration_months INTEGER NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES public.profiles(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can view codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Students can update code when activating" ON public.activation_codes;
DROP POLICY IF EXISTS "Admins can insert codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Admins can manage activation_codes" ON public.activation_codes;

-- سياسة الأمان: الإداريون والمعلمون فقط يمكنهم استعراض وإدارة أكواد الشحن
CREATE POLICY "Admins can manage activation_codes" 
    ON public.activation_codes FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- =======================================================
-- 2. دالة تفعيل كود الشحن الآمنة (RPC)
-- =======================================================
CREATE OR REPLACE FUNCTION public.redeem_activation_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_code_record RECORD;
    v_current_end TIMESTAMP WITH TIME ZONE;
    v_base_date TIMESTAMP WITH TIME ZONE;
    v_new_end_date TIMESTAMP WITH TIME ZONE;
    v_cleaned_code TEXT;
BEGIN
    -- 1. التحقق من هوية المستخدم المسجل دخوله
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'يجب تسجيل الدخول أولاً لتفعيل الكود.'
        );
    END IF;

    -- 2. تنظيف الكود المدخل
    v_cleaned_code := trim(p_code);
    IF v_cleaned_code IS NULL OR v_cleaned_code = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'يرجى إدخال كود التفعيل.'
        );
    END IF;

    -- 3. قفل السجل وفحصه لمنع التفعيل المزدوج
    SELECT * INTO v_code_record
    FROM public.activation_codes
    WHERE code = v_cleaned_code AND is_used = false
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'الكود غير صحيح أو تم استخدامه مسبقاً.'
        );
    END IF;

    -- 4. تحديد تاريخ انتهاء الاشتراك الحالي
    SELECT subscription_end_date INTO v_current_end
    FROM public.profiles
    WHERE id = v_user_id;

    -- إذا كان الاشتراك الحالي سارياً نمدد عليه، وإلا نبدأ من اللحظة الحالية
    IF v_current_end IS NOT NULL AND v_current_end > now() THEN
        v_base_date := v_current_end;
    ELSE
        v_base_date := now();
    END IF;

    -- حساب تاريخ الانتهاء الجديد
    v_new_end_date := v_base_date + (v_code_record.duration_months * INTERVAL '1 month');

    -- 5. تعليم الكود كمستخدم وحفظ هوية الطالب وتاريخ الاستخدام
    UPDATE public.activation_codes
    SET is_used = true,
        used_by = v_user_id,
        used_at = now()
    WHERE id = v_code_record.id;

    -- 6. تحديث حالة واشتراك المستخدم في جدول البروفايل
    UPDATE public.profiles
    SET status = 'approved',
        subscription_end_date = v_new_end_date
    WHERE id = v_user_id;

    -- 7. إرجاع النتيجة بنجاح
    RETURN jsonb_build_object(
        'success', true,
        'duration_months', v_code_record.duration_months,
        'subscription_end_date', v_new_end_date,
        'message', format('تم تفعيل الاشتراك بنجاح لمدة %s شهر!', v_code_record.duration_months)
    );
END;
$$;

-- منح الصلاحية لجميع المستخدمين المسجلين لتشغيل الدالة
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(TEXT) TO authenticated;
