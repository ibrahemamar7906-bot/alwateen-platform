require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("Fetching courses for primary_1...");
    const { data: courses, error: err1 } = await supabase.from('courses').select('*').eq('stage', 'primary_1');
    if (err1) { console.error("Error fetching courses:", err1); return; }
    
    console.log("Courses found:", courses.length);
    for (const c of courses) {
        console.log(`- [${c.id}] ${c.title} (${c.description})`);
        
        const { data: lessons, error: err2 } = await supabase.from('lessons').select('*').eq('course_id', c.id).order('created_at');
        if (err2) { console.error("Error fetching lessons:", err2); continue; }
        
        console.log(`  Lessons (${lessons.length}):`);
        for (const l of lessons) {
            console.log(`    * ${l.title} (Points: ${l.points_reward}, Free: ${l.is_free})`);
        }
    }
    
    // Also check lessons without course_id but with stage primary_1 (if any legacy lessons exist)
    const { data: legacyLessons, error: err3 } = await supabase.from('lessons').select('*').eq('stage', 'primary_1').is('course_id', null);
    if (err3) { console.error("Error fetching legacy lessons:", err3); }
    else if (legacyLessons && legacyLessons.length > 0) {
        console.log("\nLegacy lessons without a specific course:");
        for (const l of legacyLessons) {
            console.log(`    * ${l.title}`);
        }
    }
}

check();
