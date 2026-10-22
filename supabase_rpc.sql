-- RPC for activating subscription code securely
CREATE OR REPLACE FUNCTION activate_subscription_code(p_user_id UUID, p_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code_record RECORD;
    v_profile_record RECORD;
    v_new_end TIMESTAMP;
    v_now TIMESTAMP := now();
BEGIN
    -- Find the code
    SELECT * INTO v_code_record 
    FROM activation_codes 
    WHERE code = trim(p_code) AND is_used = false;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'الكود غير صحيح أو مستخدم من قبل.');
    END IF;

    -- Mark code as used
    UPDATE activation_codes 
    SET is_used = true, used_by = p_user_id, used_at = v_now 
    WHERE id = v_code_record.id;

    -- Update user profile
    SELECT * INTO v_profile_record FROM profiles WHERE id = p_user_id;
    
    IF v_profile_record.subscription_end_date IS NOT NULL AND v_profile_record.subscription_end_date > v_now THEN
        v_new_end := v_profile_record.subscription_end_date + (v_code_record.duration_months || ' months')::interval;
    ELSE
        v_new_end := v_now + (v_code_record.duration_months || ' months')::interval;
    END IF;

    UPDATE profiles 
    SET status = 'approved', subscription_end_date = v_new_end 
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'duration', v_code_record.duration_months, 'newEnd', v_new_end);
END;
$$;

-- RPC for submitting quiz securely
CREATE OR REPLACE FUNCTION submit_quiz_score(p_student_id UUID, p_quiz_id UUID, p_score INT, p_total INT, p_student_name TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quiz RECORD;
BEGIN
    -- Basic validation
    SELECT * INTO v_quiz FROM quizzes WHERE id = p_quiz_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'الاختبار غير موجود');
    END IF;

    -- Insert submission
    INSERT INTO quiz_submissions (quiz_id, student_id, student_name, score, total_questions)
    VALUES (p_quiz_id, p_student_id, p_student_name, p_score, p_total);

    RETURN jsonb_build_object('success', true);
END;
$$;
