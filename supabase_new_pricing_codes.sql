-- ==============================================================================
-- منصة الجُنيدي التعليمية - ترقية نظام أكواد التفعيل وكروت الشحن للأسعار الجديدة
-- ==============================================================================

-- 1. إضافة أعمدة الباقات والأسعار ورصيد الذكاء لكروت الشحن (Activation Codes)
ALTER TABLE public.activation_codes 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'student_basic',
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'باقة التفوق',
ADD COLUMN IF NOT EXISTS ai_credits INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS live_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_role VARCHAR(20) DEFAULT 'student';

-- 2. تحديث وتطوير دالة تفعيل الأكواد الآمنة (redeem_activation_code)
-- تدعم: كروت شحن رصيد AI، باقات الطلاب (التفوق / VIP مع اللايف)، وباقات المعلمين (التفاعلي / برو)
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
    v_current_credits INT;
    v_new_credits INT;
    v_current_role TEXT;
    v_added_credits INT;
    v_plan_title TEXT;
    v_msg TEXT;
BEGIN
    -- 1. التحقق من هوية المستخدم المسجل
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

    -- 3. قفل سجل الكود وفحصه لمنع الاستخدام المزدوج (Race Condition)
    SELECT * INTO v_code_record
    FROM public.activation_codes
    WHERE upper(code) = upper(v_cleaned_code) AND is_used = false
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'الكود غير صحيح أو تم استخدامه مسبقاً.'
        );
    END IF;

    -- 4. جلب بيانات البروفايل الحالي للمستخدم
    SELECT subscription_end_date, COALESCE(ai_credits_balance, 20), role 
    INTO v_current_end, v_current_credits, v_current_role
    FROM public.profiles
    WHERE id = v_user_id;

    v_added_credits := COALESCE(v_code_record.ai_credits, 0);
    v_new_credits := v_current_credits + v_added_credits;
    v_plan_title := COALESCE(v_code_record.plan_name, 'الباقة');

    -- =========================================================================
    -- الحالة الأولى: كارت شحن رصيد ذكاء اصطناعي فقط (AI Credits Card)
    -- =========================================================================
    IF v_code_record.plan_type = 'ai_credits' OR (v_code_record.duration_months = 0 AND v_added_credits > 0) THEN
        -- تحديث رصيد الكريديت في البروفايل
        UPDATE public.profiles
        SET ai_credits_balance = v_new_credits
        WHERE id = v_user_id;

        -- توثيق العملية في سجل الكريديت (Ledger)
        INSERT INTO ai_credits_ledger (user_id, amount, balance_after, action_type, description)
        VALUES (v_user_id, v_added_credits, v_new_credits, 'recharge_card', 'شحن كارت رصيد ذكاء اصطناعي: ' || v_cleaned_code);

        -- تعليم الكود كمستخدم
        UPDATE public.activation_codes
        SET is_used = true,
            used_by = v_user_id,
            used_at = now()
        WHERE id = v_code_record.id;

        RETURN jsonb_build_object(
            'success', true,
            'is_credit_only', true,
            'added_credits', v_added_credits,
            'new_credits_balance', v_new_credits,
            'message', format('تم شحن %s كريديت ذكاء اصطناعي بنجاح! 💎 رصيدك الحالي: %s كريديت.', v_added_credits, v_new_credits)
        );
    END IF;

    -- =========================================================================
    -- الحالة الثانية: كروت اشتراكات الطلاب أو المعلمين (مدد + بونص رصيد AI)
    -- =========================================================================
    IF v_current_end IS NOT NULL AND v_current_end > now() THEN
        v_base_date := v_current_end;
    ELSE
        v_base_date := now();
    END IF;

    v_new_end_date := v_base_date + (COALESCE(v_code_record.duration_months, 1) * INTERVAL '1 month');

    -- تحديث البروفايل
    UPDATE public.profiles
    SET status = 'approved',
        subscription_end_date = v_new_end_date,
        ai_credits_balance = v_new_credits,
        role = CASE 
            WHEN v_code_record.plan_type = 'teacher_pro' THEN 'teacher_pro'
            WHEN v_code_record.plan_type = 'teacher_basic' THEN 'teacher'
            ELSE role 
        END,
        live_minutes_balance = CASE 
            WHEN COALESCE(v_code_record.live_minutes, 0) > 0 THEN COALESCE(live_minutes_balance, 0) + v_code_record.live_minutes
            ELSE live_minutes_balance
        END
    WHERE id = v_user_id;

    -- إضافة الكريديت الإضافي في السجل إن وجد
    IF v_added_credits > 0 THEN
        INSERT INTO ai_credits_ledger (user_id, amount, balance_after, action_type, description)
        VALUES (v_user_id, v_added_credits, v_new_credits, 'subscription_bonus', 'رصيد إضافي هدية مع كود اشتراك: ' || v_plan_title);
    END IF;

    -- تعليم الكود كمستخدم
    UPDATE public.activation_codes
    SET is_used = true,
        used_by = v_user_id,
        used_at = now()
    WHERE id = v_code_record.id;

    v_msg := format('تم تفعيل (%s) بنجاح لمدة %s شهر!', v_plan_title, v_code_record.duration_months);
    IF v_added_credits > 0 THEN
        v_msg := v_msg || format(' ومبروك حصلت على %s كريديت ذكاء اصطناعي هدية 🎁💎', v_added_credits);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'plan_name', v_plan_title,
        'duration_months', v_code_record.duration_months,
        'subscription_end_date', v_new_end_date,
        'added_credits', v_added_credits,
        'new_credits_balance', v_new_credits,
        'message', v_msg
    );
END;
$$;

-- 3. دالة activate_subscription_code (للمعلمين والمساعدين)
CREATE OR REPLACE FUNCTION public.activate_subscription_code(p_user_id UUID, p_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.redeem_activation_code(p_code);
END;
$$;

-- منح الصلاحيات للأعضاء المسجلين
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_subscription_code(UUID, TEXT) TO authenticated;
