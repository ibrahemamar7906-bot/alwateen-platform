require('dotenv').config({ path: 'e:/ملفات المنصة/-/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log("Checking profiles with role admin/teacher/teacher_pro...");
  const { data: admins, error } = await supabase.from('profiles').select('id, full_name, role, email').in('role', ['admin', 'teacher', 'teacher_pro', 'assistant']).order('created_at', { ascending: true });
  console.log(admins);
  
  console.log("\nChecking group owners...");
  const { data: groups } = await supabase.from('teacher_groups').select('teacher_id').limit(5);
  console.log(groups);
}
check();
