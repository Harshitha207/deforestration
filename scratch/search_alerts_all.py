with open(r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\src\modules\database\DatabaseModule.jsx", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
count = 0
for idx, line in enumerate(lines):
    if "alert" in line.lower() or "warning" in line.lower():
        clean_line = line.strip().encode('ascii', errors='replace').decode('ascii')
        print(f"Line {idx+1}: {clean_line}")
        count += 1
        if count > 80:
            print("Truncated list...")
            break
