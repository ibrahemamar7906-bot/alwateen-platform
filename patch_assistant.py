import os
import re

files = [
    'e:/ملفات المنصة/-/app/teacher-assistant/certificates/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/interactive-flashcards/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/leaderboard/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/ledger/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/question-bank/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/quick-quizzes/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/schedule/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/wheel/page.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/page.js'
]

patch_code = """
      let finalId = user.id;
      if (profile?.role === 'assistant') {
        const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single();
        if (adminProfile) { finalId = adminProfile.id; }
      }
"""

for file in files:
    if not os.path.exists(file):
        continue
        
    with open(file, 'r', encoding='utf8') as f:
        content = f.read()

    # Look for the exact place to insert finalId logic: right after the role check
    # usually: if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) { ... return }
    # or something similar.
    # We can just look for "setTeacher(" and insert it right before that line, 
    # but wait, some files fetch data BEFORE setTeacher, e.g. question-bank: "await loadSavedPackages(user.id, profile?.role)"
    
    # Let's insert the patch right after we fetch the profile or right before we use user.id in setTeacher
    # Better: just replace `id: user.id` with `id: finalId` and inject the patch right before `setTeacher(`
    
    # Find the block where `setTeacher` is called.
    match = re.search(r"(\s+setTeacher\(\{.*?\n)", content)
    if not match:
        match = re.search(r"(\s+setTeacher\(\{)", content)
        
    if match:
        # Check if we already patched
        if 'finalId' in content:
            continue
            
        insertion_point = match.group(1)
        
        # Replace the `user.id` with `finalId` in the rest of the block
        new_content = content.replace('id: user.id', 'id: finalId')
        
        # Also replace function calls that use user.id immediately after setTeacher
        new_content = new_content.replace('loadSavedPackages(user.id', 'loadSavedPackages(finalId')
        new_content = new_content.replace('fetchSavedQuizzes(user.id', 'fetchSavedQuizzes(finalId')
        new_content = new_content.replace('fetchSavedSchedules(user.id', 'fetchSavedSchedules(finalId')
        
        # Now insert the patch definition
        new_content = new_content.replace(insertion_point, patch_code + insertion_point)
        
        with open(file, 'w', encoding='utf8') as f:
            f.write(new_content)
        print(f"Patched {file}")
