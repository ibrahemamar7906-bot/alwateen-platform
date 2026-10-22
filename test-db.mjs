import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envStr = fs.readFileSync('e:\\ملفات المنصة\\-\\.env.local', 'utf-8')
const urlMatch = envStr.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
const keyMatch = envStr.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim())
  const { data } = await supabase.from('lessons').select('id, title, course_id, allowed_stages').order('created_at', { ascending: false }).limit(5)
  console.log(JSON.stringify(data, null, 2))
}
