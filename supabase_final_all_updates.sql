-- =======================================================
-- ملف التحديث الشامل لجميع إضافات منصة الوتين (الإصدار 2.0 + الإشعارات)
-- =======================================================

-- 1. إضافة عمود النقاط لجدول الطلاب (profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- =======================================================

-- 2. إنشاء جدول الكورسات (Courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by everyone" 
    ON public.courses FOR SELECT USING (true);

CREATE POLICY "Admins can manage courses" 
    ON public.courses FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- =======================================================

-- 3. تحديث جدول الدروس (lessons) ليدعم الكورسات والمكافآت
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS points_reward INTEGER DEFAULT 50;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- =======================================================

-- 4. إنشاء جدول تقدم الطالب وإنجاز الدروس (Student Progress)
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, lesson_id) -- يمنع تسجيل إنجاز الدرس مرتين لنفس الطالب
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own progress" 
    ON public.student_progress FOR SELECT 
    USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress" 
    ON public.student_progress FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all progress" 
    ON public.student_progress FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- =======================================================

-- 5. إنشاء دالة (Function) آمنة لإعطاء النقاط للطالب عند إكمال الدرس
CREATE OR REPLACE FUNCTION award_points_for_lesson(p_lesson_id UUID, p_student_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- التأكد من أن الطالب لم يكمل الدرس مسبقاً
  SELECT EXISTS(
    SELECT 1 FROM public.student_progress 
    WHERE student_id = p_student_id AND lesson_id = p_lesson_id
  ) INTO v_exists;

  IF v_exists THEN
    RAISE EXCEPTION 'لقد حصلت على نقاط هذا الدرس مسبقاً';
  END IF;

  -- جلب عدد النقاط المخصصة للدرس
  SELECT points_reward INTO v_points FROM public.lessons WHERE id = p_lesson_id;

  IF v_points IS NULL THEN
    v_points := 0;
  END IF;

  -- تسجيل الدرس كمنجز
  INSERT INTO public.student_progress (student_id, lesson_id, completed)
  VALUES (p_student_id, p_lesson_id, true);

  -- تحديث نقاط الطالب
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + v_points
  WHERE id = p_student_id;
END;
$$;

-- =======================================================

-- 6. إنشاء جدول الإشعارات (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (read)" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications" 
    ON public.notifications FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- =======================================================
-- تمت العمليات بنجاح!
