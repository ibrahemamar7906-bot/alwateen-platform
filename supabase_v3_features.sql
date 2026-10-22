-- ==========================================
-- تحديث قاعدة البيانات للميزات المتقدمة (Gamification, Parents, Battles)
-- ==========================================

-- 1. تحديث جدول المستخدمين (profiles) لدعم نظام الألعاب وولي الأمر
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'مبتدئ';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- إنشاء دالة لتوليد كود طالب عشوائي فريد عند إنشاء حساب جديد
CREATE OR REPLACE FUNCTION generate_student_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' AND NEW.student_code IS NULL THEN
    NEW.student_code := 'JND-' || upper(substr(md5(random()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_student_code ON public.profiles;
CREATE TRIGGER trigger_generate_student_code
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION generate_student_code();

-- تحديث دالة إعطاء النقاط (award_points_for_lesson) لترقية المستوى تلقائياً
CREATE OR REPLACE FUNCTION award_points_for_lesson(p_lesson_id UUID, p_student_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
  v_exists BOOLEAN;
  v_current_points INTEGER;
  v_new_level TEXT;
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

  -- جلب النقاط الحالية للطالب
  SELECT COALESCE(points, 0) INTO v_current_points FROM public.profiles WHERE id = p_student_id;
  v_current_points := v_current_points + v_points;

  -- تحديد المستوى الجديد بناءً على النقاط
  IF v_current_points >= 2000 THEN
    v_new_level := 'أسطورة اللغة';
  ELSIF v_current_points >= 1000 THEN
    v_new_level := 'فارس النحو';
  ELSIF v_current_points >= 500 THEN
    v_new_level := 'متقدم';
  ELSE
    v_new_level := 'مبتدئ';
  END IF;

  -- تحديث بيانات الطالب
  UPDATE public.profiles
  SET points = v_current_points,
      level = v_new_level
  WHERE id = p_student_id;
END;
$$;


-- ==========================================
-- 2. جدول بنك أسئلة التحديات (Questions Bank)
CREATE TABLE IF NOT EXISTS public.questions_bank (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.questions_bank ENABLE ROW LEVEL SECURITY;

-- الجميع يقرأ الأسئلة
CREATE POLICY "Questions are viewable by everyone" 
    ON public.questions_bank FOR SELECT USING (true);

-- الأدمن فقط يضيف الأسئلة
CREATE POLICY "Admins can manage questions" 
    ON public.questions_bank FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- إدخال بعض الأسئلة التجريبية
INSERT INTO public.questions_bank (question, option_a, option_b, option_c, option_d, correct_option)
VALUES 
('كلمة "يذهب" هي فعل:', 'ماضٍ', 'مضارع', 'أمر', 'اسم', 'B'),
('الجملة الاسمية تتكون من:', 'فعل وفاعل', 'مبتدأ وخبر', 'فعل ومفعول به', 'جار ومجرور', 'B'),
('أداة نصب الفعل المضارع مما يلي هي:', 'لم', 'لا الناهية', 'أن', 'من', 'C')
ON CONFLICT DO NOTHING;


-- ==========================================
-- 3. جدول نتائج التحديات (Battles)
CREATE TABLE IF NOT EXISTS public.battles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own battles" 
    ON public.battles FOR SELECT 
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can insert battle results" 
    ON public.battles FOR INSERT 
    WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Admins can view all battles" 
    ON public.battles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );
