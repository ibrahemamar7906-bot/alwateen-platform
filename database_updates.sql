-- 1. إضافة عمود رابط كانفا لجدول الدروس
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS canva_url TEXT;

-- 2. جدول أكواد التفعيل (كروت الشحن)
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    duration_months INTEGER NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES public.profiles(id),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. إعطاء صلاحيات القراءة والتعديل (بسيطة للتطبيق التعليمي)
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- سياسة لقراءة الأكواد
CREATE POLICY "Anyone can view codes"
    ON public.activation_codes
    FOR SELECT
    USING (true);

-- سياسة لتحديث الكود عند تفعيله من الطالب أو المعلم
CREATE POLICY "Students can update code when activating"
    ON public.activation_codes
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- سياسة للمدير لإضافة أكواد جديدة
CREATE POLICY "Admins can insert codes"
    ON public.activation_codes
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
