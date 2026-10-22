-- Table: assistant_links
CREATE TABLE IF NOT EXISTS public.assistant_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assistant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assistant_id, teacher_id)
);

-- Table: teacher_codes
CREATE TABLE IF NOT EXISTS public.teacher_codes (
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assistant_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_codes ENABLE ROW LEVEL SECURITY;

-- Policies for teacher_codes
-- Anyone can read codes (so the assistant can verify the code)
CREATE POLICY "Anyone can view teacher codes" ON public.teacher_codes FOR SELECT USING (true);

-- Only the teacher can insert/update their own code
CREATE POLICY "Teachers can manage their own code" ON public.teacher_codes
FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- Policies for assistant_links
-- Assistant can read their own links
CREATE POLICY "Assistants can view their own links" ON public.assistant_links FOR SELECT USING (auth.uid() = assistant_id);

-- Teacher can read links directed to them
CREATE POLICY "Teachers can view links directed to them" ON public.assistant_links FOR SELECT USING (auth.uid() = teacher_id);

-- Assistant can create a link
CREATE POLICY "Assistants can create links" ON public.assistant_links FOR INSERT WITH CHECK (auth.uid() = assistant_id);

-- Teacher can update the status of links directed to them
CREATE POLICY "Teachers can update their links" ON public.assistant_links FOR UPDATE USING (auth.uid() = teacher_id);

-- Assistant can delete their own pending links, Teacher can delete any link
CREATE POLICY "Users can delete relevant links" ON public.assistant_links FOR DELETE USING (auth.uid() = assistant_id OR auth.uid() = teacher_id);
