-- ==========================================
-- 1. Game Scores Table (لألعاب الأطفال)
-- ==========================================
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name TEXT NOT NULL,
    game_name TEXT NOT NULL,
    subject TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- سياسات الأمان للعبة (الكل يقدر يضيف نتيجته ويشوف الأوائل)
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for game_scores" ON game_scores 
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert for game_scores" ON game_scores 
    FOR INSERT WITH CHECK (true);


-- ==========================================
-- 2. Student Profiles (للنقاط والمكافآت)
-- ==========================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name TEXT UNIQUE NOT NULL,
    coins INTEGER NOT NULL DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- سياسات الأمان (قراءة عامة وإضافة عامة مبدئياً)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for student_profiles" ON student_profiles 
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert for student_profiles" ON student_profiles 
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow public update for student_profiles" ON student_profiles 
    FOR UPDATE USING (true);


-- ==========================================
-- 3. Question Banks (بنوك الأسئلة للمعلمين)
-- ==========================================
CREATE TABLE IF NOT EXISTS question_banks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    stage TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT
);

ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read question_banks" ON question_banks FOR SELECT USING (true);
CREATE POLICY "Allow public read bank_questions" ON bank_questions FOR SELECT USING (true);
CREATE POLICY "Allow all actions on question_banks" ON question_banks FOR ALL USING (true);
CREATE POLICY "Allow all actions on bank_questions" ON bank_questions FOR ALL USING (true);

-- إضافة بنك أسئلة افتراضي (للتجربة)
INSERT INTO question_banks (id, title, subject, stage) 
VALUES ('11111111-1111-1111-1111-111111111111', 'بنك أسئلة لغة عربية شامل', 'Arabic', 'All') ON CONFLICT DO NOTHING;

INSERT INTO bank_questions (bank_id, question_text, options, correct_answer, explanation)
VALUES 
('11111111-1111-1111-1111-111111111111', 'ما إعراب الفاعل دائماً؟', '["مرفوع", "منصوب", "مجرور", "مجزوم"]', 'مرفوع', 'الفاعل دائماً يكون مرفوعاً في اللغة العربية.'),
('11111111-1111-1111-1111-111111111111', 'الجملة الاسمية تتكون من:', '["فعل وفاعل", "مبتدأ وخبر", "فعل ومفعول به", "مضاف ومضاف إليه"]', 'مبتدأ وخبر', 'الجملة الاسمية ركناها الأساسيان هما المبتدأ والخبر.') ON CONFLICT DO NOTHING;
