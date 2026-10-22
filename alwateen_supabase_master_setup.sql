-- ==============================================================================
--  منصة الوتين التعليمية - Al-Wateen Educational Platform
--  إشراف: المستر إبراهيم عمار
--  MASTER DATABASE SETUP SCRIPT (COMPLETE SUPABASE SCHEMA)
--  هذا الملف يحتوي على جميع الجداول، الصلاحيات (RLS)، والدوال (RPC) لتشغيل المنصة من الصفر
-- ==============================================================================

-- 1. تفعيل الامتدادات الضرورية (Extensions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. جدول المستخدمين والملفات الشخصية (Profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    stage TEXT,
    phone TEXT,
    parent_phone TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'teacher', 'assistant', 'parent')),
    points INTEGER DEFAULT 0,
    level TEXT DEFAULT 'مبتدئ',
    badges TEXT[] DEFAULT '{}',
    student_code TEXT UNIQUE,
    plan_type VARCHAR(50) DEFAULT 'free',
    has_live BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'approved',
    is_active BOOLEAN DEFAULT true,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    trial_status TEXT DEFAULT 'inactive',
    live_minutes_balance INTEGER DEFAULT 0,
    ai_credits_balance NUMERIC(10, 2) DEFAULT 0.00,
    specialty TEXT,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    active_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- دالة لتجنب التكرار اللانهائي في RLS للبروفايل
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- دالة توليد كود طالب فريد تلقائياً
CREATE OR REPLACE FUNCTION public.generate_student_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN;
BEGIN
    IF NEW.student_code IS NULL OR NEW.student_code = '' THEN
        done := FALSE;
        WHILE NOT done LOOP
            new_code := 'WAT-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
            IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE student_code = new_code) THEN
                done := TRUE;
            END IF;
        END LOOP;
        NEW.student_code := new_code;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_student_code ON public.profiles;
CREATE TRIGGER trigger_generate_student_code
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_student_code();

-- تريجر لإنشاء بروفايل تلقائياً عند تسجيل أي مستخدم جديد في Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone, 
    parent_phone, 
    stage, 
    role, 
    status, 
    plan_type, 
    points
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'parent_phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'stage', 'general'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'approved',
    'free',
    10
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. المحتوى التعليمي: الكورسات والدروس والملفات (Courses, Lessons, Handouts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT,
    video_url TEXT,
    canva_url TEXT,
    pdf_url TEXT,
    points_reward INTEGER DEFAULT 10,
    is_free BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    quiz_data JSONB,
    quiz_theme TEXT,
    allowed_stages JSONB,
    status TEXT DEFAULT 'published',
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.handouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE IF NOT EXISTS public.flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    rule TEXT,
    example1 TEXT,
    example2 TEXT,
    theme TEXT,
    custom_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.live_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    stage TEXT,
    channel_name TEXT NOT NULL,
    room_code TEXT,
    deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE SET NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT false,
    room_type TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'rejected')),
    grade TEXT,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lesson_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. نظام أكواد التفعيل والاشتراكات (Activation Codes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    stage TEXT NOT NULL,
    type TEXT DEFAULT 'subscription',
    plan_type TEXT DEFAULT 'student_basic',
    duration_days INTEGER DEFAULT 30,
    duration_months INTEGER DEFAULT 1,
    has_live BOOLEAN DEFAULT false,
    live_minutes INTEGER DEFAULT 0,
    ai_credits NUMERIC(10, 2) DEFAULT 0.00,
    price NUMERIC(10, 2) DEFAULT 0.00,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES public.profiles(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. نظام الاختبارات والتقييمات (Quizzes System)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT,
    duration_minutes INTEGER DEFAULT 30,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT,
    score NUMERIC DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    answers JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. مجتمع الطلاب والإشعارات (Community & Notifications)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    stage TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. الألعاب التعليمية والبطاقات والتحديات (Gamification & Battles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage TEXT NOT NULL,
    subject TEXT DEFAULT 'لغة عربية',
    category TEXT,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option INTEGER NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    points INTEGER DEFAULT 20,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT,
    subject TEXT,
    game_id TEXT,
    game_name TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE IF NOT EXISTS public.student_grammar_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_key TEXT NOT NULL,
    current_question_index INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, lesson_key)
);

CREATE TABLE IF NOT EXISTS public.student_inference_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_key TEXT NOT NULL,
    current_question_index INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, lesson_key)
);

CREATE TABLE IF NOT EXISTS public.student_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_name TEXT,
    mistake_item TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. مساعد المعلم ومتابعة المجموعات والسنتر (Teacher Assistant & Tracker)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assistant_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_codes (
    teacher_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT,
    phone TEXT,
    parent_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage TEXT,
    schedule_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_group_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.teacher_groups(id) ON DELETE CASCADE,
    student_id UUID,
    name TEXT,
    phone TEXT,
    parent_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.teacher_groups(id) ON DELETE CASCADE,
    student_id UUID,
    session_date DATE NOT NULL,
    status TEXT DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.teacher_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    exam_name TEXT,
    max_score NUMERIC DEFAULT 100,
    exam_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_exam_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.teacher_exams(id) ON DELETE CASCADE,
    student_id UUID,
    score NUMERIC DEFAULT 0,
    max_score NUMERIC DEFAULT 100,
    exam_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID,
    group_id UUID,
    name TEXT,
    phone TEXT,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    payment_reference TEXT,
    payment_type TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'paid',
    month TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week TEXT,
    start_time TEXT,
    end_time TEXT,
    group_name TEXT,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID,
    topic TEXT,
    session_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teacher_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT,
    is_active BOOLEAN DEFAULT true,
    quiz_id TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. الدوال الإجرائية المخزنة (RPC Functions)
-- ==============================================================================

-- أ. تفعيل كود الاشتراك بواسطة الطالب (Redeem Activation Code)
CREATE OR REPLACE FUNCTION public.redeem_activation_code(code_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code_record RECORD;
    v_user_id UUID;
    v_current_end TIMESTAMP WITH TIME ZONE;
    v_new_end TIMESTAMP WITH TIME ZONE;
    v_added_days INTEGER;
    v_plan_type VARCHAR(50);
    v_has_live BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً');
    END IF;

    SELECT * INTO v_code_record
    FROM public.activation_codes
    WHERE code = UPPER(TRIM(code_text)) AND is_used = false
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'الكود غير صحيح أو تم استخدامه من قبل');
    END IF;

    v_added_days := COALESCE(v_code_record.duration_days, v_code_record.duration_months * 30, 30);
    v_plan_type  := COALESCE(v_code_record.plan_type, 'student_basic');
    v_has_live   := COALESCE(v_code_record.has_live, false);

    SELECT subscription_end_date INTO v_current_end
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_current_end IS NOT NULL AND v_current_end > NOW() THEN
        v_new_end := v_current_end + (v_added_days || ' days')::INTERVAL;
    ELSE
        v_new_end := NOW() + (v_added_days || ' days')::INTERVAL;
    END IF;

    UPDATE public.profiles
    SET status = 'approved',
        plan_type = v_plan_type,
        has_live = CASE WHEN v_has_live THEN true ELSE has_live END,
        subscription_end_date = v_new_end,
        stage = COALESCE(v_code_record.stage, stage)
    WHERE id = v_user_id;

    UPDATE public.activation_codes
    SET is_used = true,
        used_by = v_user_id,
        used_at = NOW()
    WHERE id = v_code_record.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'تم تفعيل الاشتراك بنجاح',
        'new_end_date', v_new_end,
        'plan_type', v_plan_type
    );
END;
$$;

-- ب. دالة بديلة للتفعيل (activate_subscription_code)
CREATE OR REPLACE FUNCTION public.activate_subscription_code(code_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.redeem_activation_code(code_text);
END;
$$;

-- ج. تعيين باقة الطالب من قبل الإدارة (Admin Set Student Package)
CREATE OR REPLACE FUNCTION public.admin_set_student_package(
    p_student_id UUID,
    p_plan_type TEXT,
    p_days INTEGER,
    p_has_live BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_end TIMESTAMP WITH TIME ZONE;
    v_new_end TIMESTAMP WITH TIME ZONE;
BEGIN
    IF public.get_my_role() NOT IN ('admin', 'teacher') THEN
        RETURN jsonb_build_object('success', false, 'message', 'غير مصرح لك بتنفيذ هذه العملية');
    END IF;

    SELECT subscription_end_date INTO v_current_end
    FROM public.profiles
    WHERE id = p_student_id;

    IF p_days <= 0 THEN
        v_new_end := NOW() - INTERVAL '1 day';
    ELSIF v_current_end IS NOT NULL AND v_current_end > NOW() THEN
        v_new_end := v_current_end + (p_days || ' days')::INTERVAL;
    ELSE
        v_new_end := NOW() + (p_days || ' days')::INTERVAL;
    END IF;

    UPDATE public.profiles
    SET status = 'approved',
        plan_type = p_plan_type,
        has_live = p_has_live,
        subscription_end_date = v_new_end
    WHERE id = p_student_id;

    RETURN jsonb_build_object('success', true, 'message', 'تم تحديث باقة الطالب بنجاح', 'new_end_date', v_new_end);
END;
$$;

-- د. إضافة نقاط مكافأة عند إنهاء درس (Award Points)
CREATE OR REPLACE FUNCTION public.award_points_for_lesson(
    p_student_id UUID,
    p_points INTEGER,
    p_lesson_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_points INTEGER;
    v_new_level TEXT;
BEGIN
    SELECT COALESCE(points, 0) INTO v_current_points FROM public.profiles WHERE id = p_student_id;
    v_current_points := v_current_points + p_points;

    IF v_current_points >= 500 THEN
        v_new_level := 'أسطورة اللغة';
    ELSIF v_current_points >= 250 THEN
        v_new_level := 'فارس البلاغة';
    ELSIF v_current_points >= 100 THEN
        v_new_level := 'نجم النحو';
    ELSE
        v_new_level := 'مبتدئ';
    END IF;

    UPDATE public.profiles
    SET points = v_current_points,
        level = v_new_level
    WHERE id = p_student_id;

    INSERT INTO public.student_progress (student_id, lesson_id, completed, completed_at)
    VALUES (p_student_id, p_lesson_id, true, NOW())
    ON CONFLICT (student_id, lesson_id) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'points', v_current_points, 'level', v_new_level);
END;
$$;

-- هـ. تسجيل نتيجة اختبار (Submit Quiz Score)
CREATE OR REPLACE FUNCTION public.submit_quiz_score(
    p_quiz_id UUID,
    p_score NUMERIC,
    p_total INTEGER,
    p_answers JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_student_name TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'يجب تسجيل الدخول أولاً');
    END IF;

    SELECT full_name INTO v_student_name FROM public.profiles WHERE id = v_user_id;

    INSERT INTO public.quiz_submissions (
        quiz_id,
        student_id,
        student_name,
        score,
        total_questions,
        answers,
        submitted_at
    )
    VALUES (
        p_quiz_id,
        v_user_id,
        COALESCE(v_student_name, 'طالب'),
        p_score,
        p_total,
        p_answers,
        NOW()
    );

    RETURN jsonb_build_object('success', true, 'message', 'تم تسجيل النتيجة بنجاح');
END;
$$;

-- و. الإعجاب بمنشور (Toggle Like)
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.community_posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = p_post_id;
    RETURN jsonb_build_object('success', true);
END;
$$;

-- ==============================================================================
-- 10. تفعيل سياسات الأمان والحماية (Row Level Security - RLS)
-- ==============================================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grammar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_inference_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_group_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;

-- 1. سياسات جدول البروفايل (Profiles Policies - بدون تكرار لانهائي)
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert during registration" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "Allow insert during registration" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. سياسات المحتوى التعليمي (الكورسات والدروس: قراءة للجميع، تعديل للإدارة)
DROP POLICY IF EXISTS "Public can read published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Public can read published courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Public can read published lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins manage lessons" ON public.lessons;
CREATE POLICY "Public can read published lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins manage lessons" ON public.lessons FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

-- 3. تقدم الطالب (Student Progress)
DROP POLICY IF EXISTS "Students view own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students update own progress" ON public.student_progress;
CREATE POLICY "Students view own progress" ON public.student_progress FOR SELECT USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "Students update own progress" ON public.student_progress FOR ALL USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));

-- 4. سياسات الاختبارات
DROP POLICY IF EXISTS "Public view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins manage quizzes" ON public.quizzes;
CREATE POLICY "Public view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Admins manage quizzes" ON public.quizzes FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Public view quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins manage quiz questions" ON public.quiz_questions;
CREATE POLICY "Public view quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admins manage quiz questions" ON public.quiz_questions FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Students view own submissions" ON public.quiz_submissions;
DROP POLICY IF EXISTS "Students submit quiz" ON public.quiz_submissions;
CREATE POLICY "Students view own submissions" ON public.quiz_submissions FOR SELECT USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY "Students submit quiz" ON public.quiz_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 5. أكواد التفعيل (حماية مشددة: الإدارة فقط ترى كل الأكواد)
DROP POLICY IF EXISTS "Admins manage activation codes" ON public.activation_codes;
CREATE POLICY "Admins manage activation codes" ON public.activation_codes FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

-- 6. المجتمع والمنشورات
DROP POLICY IF EXISTS "Public view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Auth users create posts" ON public.community_posts;
CREATE POLICY "Public view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Auth users create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Public view community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Auth users create comments" ON public.community_comments;
CREATE POLICY "Public view community comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Auth users create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 7. الإشعارات
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'teacher'));

-- 8. مساعد المعلم ومتابعة السنتر (Teacher Assistant / Tracker)
DROP POLICY IF EXISTS "Teachers and assistants manage tracker" ON public.teacher_students;
CREATE POLICY "Teachers and assistants manage tracker" ON public.teacher_students FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage groups" ON public.teacher_groups;
CREATE POLICY "Teachers and assistants manage groups" ON public.teacher_groups FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage group students" ON public.teacher_group_students;
CREATE POLICY "Teachers and assistants manage group students" ON public.teacher_group_students FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage attendance" ON public.teacher_attendance;
CREATE POLICY "Teachers and assistants manage attendance" ON public.teacher_attendance FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage exams" ON public.teacher_exams;
CREATE POLICY "Teachers and assistants manage exams" ON public.teacher_exams FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage exam scores" ON public.teacher_exam_scores;
CREATE POLICY "Teachers and assistants manage exam scores" ON public.teacher_exam_scores FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage payments" ON public.teacher_payments;
CREATE POLICY "Teachers and assistants manage payments" ON public.teacher_payments FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage schedules" ON public.teacher_schedules;
CREATE POLICY "Teachers and assistants manage schedules" ON public.teacher_schedules FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage sessions" ON public.teacher_sessions;
CREATE POLICY "Teachers and assistants manage sessions" ON public.teacher_sessions FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers and assistants manage rosters" ON public.teacher_rosters;
CREATE POLICY "Teachers and assistants manage rosters" ON public.teacher_rosters FOR ALL USING (public.get_my_role() IN ('admin', 'teacher', 'assistant'));

DROP POLICY IF EXISTS "Teachers manage assistant links" ON public.assistant_links;
CREATE POLICY "Teachers manage assistant links" ON public.assistant_links FOR ALL USING (auth.uid() = teacher_id OR auth.uid() = assistant_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Teachers manage teacher codes" ON public.teacher_codes;
CREATE POLICY "Teachers manage teacher codes" ON public.teacher_codes FOR ALL USING (auth.uid() = teacher_id OR public.get_my_role() IN ('admin', 'teacher'));

-- 9. بنك الأسئلة والبطاقات والألعاب التفاعلية
DROP POLICY IF EXISTS "Public view questions bank" ON public.questions_bank;
DROP POLICY IF EXISTS "Admins manage questions bank" ON public.questions_bank;
CREATE POLICY "Public view questions bank" ON public.questions_bank FOR SELECT USING (true);
CREATE POLICY "Admins manage questions bank" ON public.questions_bank FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Public view flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Admins manage flashcards" ON public.flashcards;
CREATE POLICY "Public view flashcards" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "Admins manage flashcards" ON public.flashcards FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Public view decks" ON public.flashcard_decks;
DROP POLICY IF EXISTS "Admins manage decks" ON public.flashcard_decks;
CREATE POLICY "Public view decks" ON public.flashcard_decks FOR SELECT USING (true);
CREATE POLICY "Admins manage decks" ON public.flashcard_decks FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage grammar progress" ON public.student_grammar_progress;
CREATE POLICY "Users manage grammar progress" ON public.student_grammar_progress FOR ALL USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage inference progress" ON public.student_inference_progress;
CREATE POLICY "Users manage inference progress" ON public.student_inference_progress FOR ALL USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage battles" ON public.battles;
CREATE POLICY "Users manage battles" ON public.battles FOR ALL USING (auth.uid() = player1_id OR auth.uid() = player2_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage game scores" ON public.game_scores;
CREATE POLICY "Users manage game scores" ON public.game_scores FOR ALL USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage performance" ON public.student_performance;
CREATE POLICY "Users manage performance" ON public.student_performance FOR ALL USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage handouts" ON public.handouts;
CREATE POLICY "Users manage handouts" ON public.handouts FOR ALL USING (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users manage homework" ON public.homework_submissions;
CREATE POLICY "Users manage homework" ON public.homework_submissions FOR ALL USING (auth.uid() = student_id OR public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Public view live rooms" ON public.live_rooms;
DROP POLICY IF EXISTS "Admins manage live rooms" ON public.live_rooms;
CREATE POLICY "Public view live rooms" ON public.live_rooms FOR SELECT USING (true);
CREATE POLICY "Admins manage live rooms" ON public.live_rooms FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Authenticated view lesson questions" ON public.lesson_questions;
DROP POLICY IF EXISTS "Students post lesson questions" ON public.lesson_questions;
DROP POLICY IF EXISTS "Teachers answer lesson questions" ON public.lesson_questions;
DROP POLICY IF EXISTS "Users delete own lesson questions" ON public.lesson_questions;
CREATE POLICY "Authenticated view lesson questions" ON public.lesson_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students post lesson questions" ON public.lesson_questions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers answer lesson questions" ON public.lesson_questions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users delete own lesson questions" ON public.lesson_questions FOR DELETE TO authenticated USING (student_id = auth.uid() OR public.get_my_role() IN ('admin', 'teacher'));

-- دالة احتياطية لتحديث النقاط أو العمليات التوافقية (Legacy Compatibility)
CREATE OR REPLACE FUNCTION public.topup_ai_credits(target_user_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + amount::INTEGER
  WHERE id = target_user_id;
END;
$$;

-- دالة تحديث نقاط ومستوى الطالب (Add Student Points & Level)
CREATE OR REPLACE FUNCTION public.add_student_points(p_user_id UUID, p_points_to_add INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_points INTEGER;
    v_new_level INTEGER;
BEGIN
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + p_points_to_add,
        level = GREATEST(1, FLOOR((COALESCE(points, 0) + p_points_to_add) / 100) + 1)
    WHERE id = p_user_id
    RETURNING points, level INTO v_new_points, v_new_level;

    RETURN jsonb_build_object(
        'success', true,
        'newPoints', v_new_points,
        'newLevel', v_new_level
    );
END;
$$;

-- ==============================================================================
-- انتهى إعداد قاعدة بيانات منصة الوتين التعليمية بنجاح!
-- ==============================================================================
