ALTER TABLE quiz_submissions ADD COLUMN IF NOT EXISTS student_id UUID;
ALTER TABLE quiz_submissions ALTER COLUMN answers SET DEFAULT '{}'::jsonb;
ALTER TABLE quiz_submissions ALTER COLUMN answers DROP NOT NULL;

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
        RETURN jsonb_build_object('success', false, 'error', 'Quiz not found');
    END IF;

    -- Insert submission securely
    INSERT INTO quiz_submissions (quiz_id, student_id, student_name, score, total_questions, answers)
    VALUES (p_quiz_id, p_student_id, p_student_name, p_score, p_total, '{}'::jsonb);

    RETURN jsonb_build_object('success', true);
END;
$$;
