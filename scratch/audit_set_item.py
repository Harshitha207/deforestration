import os
import re

src_dir = r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            if "deforestation_search_details" in content and "setItem" in content:
                print(f"File: {path}")
                matches = re.finditer(r"localStorage\.setItem\('deforestation_search_details'[^;]+;", content)
                for m in matches:
                    print(f"  Line matches:\n{m.group(0)}")
