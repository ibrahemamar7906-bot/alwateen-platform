-- Fix Infinite Recursion in Profiles RLS

-- 1. Create a secure function that bypasses RLS to check roles
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- 2. Drop the recursive policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 3. Create the non-recursive policies
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ( get_my_role() = 'admin' );

CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING ( get_my_role() = 'admin' );

-- 4. Fix other tables to use the optimized function (Optional but recommended for performance)
DROP POLICY IF EXISTS "Admins have full access to activation codes" ON activation_codes;
CREATE POLICY "Admins have full access to activation codes" 
ON activation_codes FOR ALL 
USING ( get_my_role() = 'admin' );

DROP POLICY IF EXISTS "Teachers and Admins can manage quizzes" ON quizzes;
CREATE POLICY "Teachers and Admins can manage quizzes" 
ON quizzes FOR ALL 
USING ( get_my_role() IN ('teacher', 'admin') );
