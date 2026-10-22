import io
path = r"e:\منصة الجنيدي\app\admin-dashboard\components\QuizManagerTab.js"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

# Fix the literal backtick-n that PowerShell inserted
c = c.replace("`n", "\n")

import re
# Ensure clean replacement
c = re.sub(r'<option value="مستويات عليا">مستويات عليا</option>\s*(<option value="كوكتيل[^>]*>[^<]*</option>)?', 
           '<option value="مستويات عليا">مستويات عليا</option>\n                          <option value="كوكتيل (منوع)">كوكتيل (منوع)</option>', c)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("Done")
