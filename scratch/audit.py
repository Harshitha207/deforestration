import os
import re

modules_dir = r"c:\Users\dhanu\OneDrive\Desktop\deforestration_project\src\modules"
modules = [
    "visualization/VisualizationModule.jsx",
    "charts/ChartModule.jsx",
    "database/DatabaseModule.jsx",
    "alerts/AlertsModule.jsx",
    "prediction/PredictionModule.jsx",
    "satellite-fetch/SatelliteFetchModule.jsx",
    "export-report/ExportReportModule.jsx",
    "gee-console/GeeConsoleModule.jsx"
]

print("--- AUDITING MODULES ---")
for mod in modules:
    path = os.path.join(modules_dir, mod)
    if not os.path.exists(path):
        print(f"ERROR: {mod} does not exist at {path}")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print(f"\nModule: {mod}")
    # Find hasData check
    has_data_match = re.search(r"const\s+hasData\s*=\s*[^;]+;", content)
    if has_data_match:
        print(f"  hasData check: {has_data_match.group(0)}")
    else:
        print("  WARNING: const hasData check not found!")
        
    # Check if we return an empty/uninitialized view
    if "hasData" in content and ("navigate" in content or "useNavigate" in content):
        # Print first few lines of component rendering return
        lines = content.split('\n')
        component_start = -1
        for idx, line in enumerate(lines):
            if "const " in line and "Module = () =>" in line:
                component_start = idx
                break
        if component_start != -1:
            print("  Component starts around line:", component_start + 1)
            # Print next 60 lines to see the check structure
            for i in range(component_start, min(component_start + 120, len(lines))):
                if "hasData" in lines[i] or "localStorage.getItem" in lines[i] or "return (" in lines[i]:
                    print(f"    Line {i+1}: {lines[i].strip()}")
    else:
        print("  WARNING: Navigation or hasData return check might be missing!")
