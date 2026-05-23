import json
import os

path = r"C:\Users\dhanu\.gemini\antigravity\brain\49b23505-ebdf-4773-a7b5-956e50714f58\.system_generated\logs\transcript.jsonl"
if not os.path.exists(path):
    print("Log file not found at", path)
    exit(1)

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total steps: {len(lines)}")
for line in lines:
    try:
        data = json.loads(line)
        if data.get("type") == "USER_INPUT":
            content = data.get("content", "")
            if "chart" in content.lower() or "alert" in content.lower() or "button" in content.lower() or "link" in content.lower():
                print(f"Step {data.get('step_index')}: [USER_INPUT] {content.strip()}")
    except Exception as e:
        pass
