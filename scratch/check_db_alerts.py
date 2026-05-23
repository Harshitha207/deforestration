with open(r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\src\modules\database\DatabaseModule.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for alert rendering
import re
matches = re.finditer(r"getAlertDetails\s*=\s*\(.*?\)\s*=>\s*\{.*?\}(?=\s*const|\s*let|\s*function|\s*useEffect|\s*return)", content, re.DOTALL)
for m in matches:
    print("Found getAlertDetails:")
    print(m.group(0))

# Also print lines matching alert warning card layout
lines = content.split('\n')
for idx, line in enumerate(lines):
    if "badge_color" in line or "CRITICAL ECOLOGICAL ALERT" in line or "NOMINAL" in line or "ECOLOGICAL ALERT" in line:
        print(f"Line {idx+1}: {line.strip()}")
