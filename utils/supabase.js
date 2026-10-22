import { createClient } from '@supabase/supabase-js'

// سنقوم بجلب هذه الأكواد من Netlify Environment Variables بدلاً من كتابتها هنا للحماية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ تنبيه: لم يتم إعداد روابط Supabase بعد. يرجى إضافتها في ملف .env.local أو في إعدادات Netlify.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)
