import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace inequality checks
    new_content = content.replace("profile?.role !== 'teacher'", "(profile?.role !== 'teacher' && profile?.role !== 'teacher_pro')")
    new_content = new_content.replace("profile.role !== 'teacher'", "(profile.role !== 'teacher' && profile.role !== 'teacher_pro')")
    new_content = new_content.replace("userProfile?.role !== 'teacher'", "(userProfile?.role !== 'teacher' && userProfile?.role !== 'teacher_pro')")
    
    # Replace equality checks
    new_content = new_content.replace("profile?.role === 'teacher'", "['teacher', 'teacher_pro'].includes(profile?.role)")
    new_content = new_content.replace("profile.role === 'teacher'", "['teacher', 'teacher_pro'].includes(profile.role)")
    new_content = new_content.replace("userProfile?.role === 'teacher'", "['teacher', 'teacher_pro'].includes(userProfile?.role)")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for root, _, files in os.walk('app'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
