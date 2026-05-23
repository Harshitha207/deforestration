with open(r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\src\modules\database\DatabaseModule.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines[:30]):
    print(f"Line {idx+1}: {line.strip()}")
