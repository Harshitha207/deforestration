with open(r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\src\modules\database\DatabaseModule.jsx", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
for idx, line in enumerate(lines):
    if "getAlertDetails" in line or "alert-card" in line or "Mitigation" in line:
        print(f"Line {idx+1}: {line.strip()}")
