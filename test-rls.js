const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log("Testing RLS on teacher_students...");
  
  // We are unauthenticated! If RLS is ON, this will fail or return []
  const { data, error } = await supabase
    .from('teacher_students')
    .select('*')
    .limit(1);
    
  console.log("Unauthenticated Select result:", { data, error });
}

testRLS();
