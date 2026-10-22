import subprocess

commits = ['5313597', '7ea3676', 'd30b4b7', '1b8d61d', 'a17eef8', 'f6f5e67', 'cb3d57a', 'ea4ecba', 'f870a87', '10ce2a1']

for commit in commits:
    res = subprocess.run(['git', '-C', 'e:\\منصة الجنيدي', 'show', f'{commit}:app/admin-dashboard/components/QuizManagerTab.js'], capture_output=True)
    text = res.stdout.decode('utf-8', errors='replace')
    if 'ظ' in text or '' in text:
        print(f'{commit}: BAD')
    else:
        print(f'{commit}: GOOD')
