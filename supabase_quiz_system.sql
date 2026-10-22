-- إنشاء جدول الاختبارات
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الأسئلة
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إجابات الطلاب
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إعداد قواعد الحماية (RLS - Row Level Security)
-- بالنسبة للاختبارات: الجميع يمكنه القراءة (للطلاب)، لكن الأدمن فقط من يضيف. للتبسيط حاليا سنجعلها قابلة للقراءة للجميع.
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on quizzes" ON quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quizzes" ON quizzes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on quizzes" ON quizzes FOR DELETE USING (true);

-- بالنسبة للأسئلة
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on quiz_questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on quiz_questions" ON quiz_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quiz_questions" ON quiz_questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on quiz_questions" ON quiz_questions FOR DELETE USING (true);

-- بالنسبة لإجابات الطلاب
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on quiz_submissions" ON quiz_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on quiz_submissions" ON quiz_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quiz_submissions" ON quiz_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on quiz_submissions" ON quiz_submissions FOR DELETE USING (true);
