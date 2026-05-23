import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.jsx'):
            path = os.path.join(root, f)
            with open(path, encoding='utf-8') as file:
                for idx, line in enumerate(file):
                    if '1995' in line or '2026' in line:
                        print(f"{path}:{idx+1}: {line.strip()}")
