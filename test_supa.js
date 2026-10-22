
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'KEY';
// We don't have the keys here directly, let's read them from .env.local
const fs = require('fs');
const envFile = fs.readFileSync('e:\\ملفات المنصة\\-\\.env.local', 'utf8');
const lines = envFile.split('\n');
let url = '', key = '';
for(let line of lines) {
  if(line.startsWith('NEXT_PUBLIC_SUPABASE_URL')) url = line.split('=')[1].trim();
  if(line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')) key = line.split('=')[1].trim();
}
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('quiz_submissions').select('*').limit(1);
  console.log('Columns:', Object.keys(data[0] || {}));
}
run();
