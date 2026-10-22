-- COMPLETE RLS RESET FOR PROFILES

-- 1. Ensure the secure role function exists
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- 2. Drop EVERY existing policy on profiles to wipe the slate clean
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 3. Create fresh, non-recursive SELECT policies
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING ( auth.uid() = id );

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ( get_my_role() = 'admin' );

-- 4. Create fresh, non-recursive UPDATE policies
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id )
WITH CHECK (
  auth.uid() = id 
  AND role = get_my_role() -- Prevent role tampering safely
);

CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING ( get_my_role() = 'admin' );

-- 5. Fix quizzes and activation codes just in case
DROP POLICY IF EXISTS "Admins have full access to activation codes" ON activation_codes;
CREATE POLICY "Admins have full access to activation codes" 
ON activation_codes FOR ALL 
USING ( get_my_role() = 'admin' );

DROP POLICY IF EXISTS "Teachers and Admins can manage quizzes" ON quizzes;
CREATE POLICY "Teachers and Admins can manage quizzes" 
ON quizzes FOR ALL 
USING ( get_my_role() IN ('teacher', 'admin') );

DROP POLICY IF EXISTS "Teachers and Admins can update homework" ON homework_submissions;
CREATE POLICY "Teachers and Admins can update homework" 
ON homework_submissions FOR UPDATE 
USING ( get_my_role() IN ('teacher', 'admin') );

DROP POLICY IF EXISTS "Users can view appropriate homework" ON homework_submissions;
CREATE POLICY "Users can view appropriate homework" 
ON homework_submissions FOR SELECT 
USING (
  auth.uid() = student_id 
  OR get_my_role() IN ('teacher', 'admin')
);

DROP POLICY IF EXISTS "Teachers and Admins can answer questions" ON lesson_questions;
CREATE POLICY "Teachers and Admins can answer questions" 
ON lesson_questions FOR UPDATE 
USING ( get_my_role() IN ('teacher', 'admin') );

DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
CREATE POLICY "Admins can manage notifications" 
ON notifications FOR ALL 
USING ( get_my_role() = 'admin' );

