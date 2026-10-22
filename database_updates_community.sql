-- =======================================================
-- ملف إعداد مجتمع الطلاب (Student Community)
-- =======================================================

-- 1. جدول المنشورات (Community Posts)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    stage TEXT NOT NULL,
    liked_by UUID[] DEFAULT '{}'::uuid[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" 
    ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
    ON public.community_posts FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" 
    ON public.community_posts FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Admins or authors can delete posts" 
    ON public.community_posts FOR DELETE 
    USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- =======================================================

-- 2. جدول التعليقات (Community Comments)
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
    ON public.community_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" 
    ON public.community_comments FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments" 
    ON public.community_comments FOR UPDATE 
    USING (auth.uid() = author_id);

CREATE POLICY "Admins or authors can delete comments" 
    ON public.community_comments FOR DELETE 
    USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'teacher')
        )
    );

-- =======================================================

-- 3. دالة إضافة الإعجاب بأمان لمنع التكرار
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_user_id = ANY (ARRAY(SELECT unnest(liked_by) FROM public.community_posts WHERE id = p_post_id)) THEN
        -- Remove like
        UPDATE public.community_posts 
        SET liked_by = array_remove(liked_by, p_user_id)
        WHERE id = p_post_id;
    ELSE
        -- Add like
        UPDATE public.community_posts 
        SET liked_by = array_append(liked_by, p_user_id)
        WHERE id = p_post_id;
    END IF;
END;
$$;
