const fs = require('fs');

const files = [
    'e:/ملفات المنصة/-/app/teacher-assistant/certificates/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/interactive-flashcards/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/leaderboard/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/ledger/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/question-bank/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/quick-quizzes/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/schedule/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/wheel/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/page.js'
];

const patch_code = `
      let finalId = user.id;
      if (profile?.role === 'assistant') {
        const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single();
        if (adminProfile) { finalId = adminProfile.id; }
      }
`;

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('let finalId = user.id;')) continue;
    
    // Find where setTeacher is called
    let match = content.match(/(\s+setTeacher\(\{)/);
    if (match) {
        let insertion_point = match[1];
        
        let new_content = content.replace(/id:\s*user\.id/g, 'id: finalId');
        new_content = new_content.replace(/loadSavedPackages\(user\.id/g, 'loadSavedPackages(finalId');
        new_content = new_content.replace(/fetchSavedQuizzes\(user\.id/g, 'fetchSavedQuizzes(finalId');
        new_content = new_content.replace(/fetchSavedSchedules\(user\.id/g, 'fetchSavedSchedules(finalId');
        
        new_content = new_content.replace(insertion_point, patch_code + insertion_point);
        
        fs.writeFileSync(file, new_content, 'utf8');
        console.log("Patched " + file);
    }
}
