with open(r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\app.py", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = re.finditer(r"def analyze\(\):.*?(?=def |$)", content, re.DOTALL)
for m in matches:
    print(m.group(0)[:1500])
