import os
import json
from datetime import datetime

def get_db_path(for_writing=False):
    """
    Returns the path to the JSON database file.
    In development (local write-access), it resolves to db_audit_logs.json in the project root.
    In read-only environments (like Vercel production), it falls back to /tmp/db_audit_logs.json.
    """
    local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db_audit_logs.json')
    if for_writing:
        dir_path = os.path.dirname(local_path)
        if os.access(dir_path, os.W_OK):
            return local_path
        return '/tmp/db_audit_logs.json'
    else:
        if os.path.exists(local_path):
            return local_path
        cwd_path = os.path.abspath('db_audit_logs.json')
        if os.path.exists(cwd_path):
            return cwd_path
        return '/tmp/db_audit_logs.json'

def save_analysis(data):
    """
    Saves deforestation transaction query analysis records.
    Attempts MongoDB connection on default port 27017, and gracefully
    falls back to writing to a persistent local JSON registry (db_audit_logs.json).
    """
    # Create database transaction record log
    record = {
        "id": int(datetime.now().timestamp() * 1000),
        "type": "insert",
        "query": "save_analysis",
        "payload": f"{{location: \"{data.get('location')}\", forest: {data.get('forest')}, deforestation: {data.get('deforestation')}, ndvi: {data.get('ndvi')}, period_loss_rate: {data.get('period_loss_rate')}}}",
        "alert": data.get("alert"),
        "period_loss_rate": data.get("period_loss_rate"),
        "status": "Success",
        "time": "Just now",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # PERSIST TO LOCAL JSON FALLBACK DATABASE FILE (Ensures instant out-of-the-box operation)
    db_path = get_db_path(for_writing=True)
    logs = []
    if os.path.exists(db_path):
        try:
            with open(db_path, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        except Exception:
            logs = []
            
    # Deduplication: If the very last saved log has the exact same location, just update its timestamp and skip adding a new one
    if len(logs) > 0:
        import re
        last_payload = logs[0].get("payload", "")
        last_loc_match = re.search(r'location:\s*["\']([^"\']+)["\']', last_payload)
        last_loc = last_loc_match.group(1) if last_loc_match else None
        
        if last_loc and last_loc.lower() == str(data.get("location", "")).lower():
            logs[0]["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            try:
                with open(db_path, 'w', encoding='utf-8') as f:
                    json.dump(logs, f, indent=2)
            except Exception:
                pass
            return True
    
    logs.insert(0, record)
    
    # Cap log database count to 50 entries
    if len(logs) > 50:
        logs = logs[:50]
        
    try:
        with open(db_path, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        print("Failed to save local JSON logs:", e)

    # ATTEMPT REAL MONGODB CLIENT PERSISTENCE (Runs seamlessly if Mongo is installed and active)
    try:
        from pymongo import MongoClient
        # Setup quick timeout connection to prevent server freeze
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=800)
        db = client['deforestation_db']
        collection = db['analysis_history']
        
        # Insert MongoDB documents
        mongo_doc = {
            "timestamp": datetime.now(),
            "location": data.get("location"),
            "forest": float(data.get("forest", 0)),
            "deforestation": float(data.get("deforestation", 0)),
            "ndvi": float(data.get("ndvi", 0)),
            "query": "save_analysis",
            "status": "Success"
        }
        collection.insert_one(mongo_doc)
        print("MongoDB Transaction stored successfully inside collection analysis_history!")
    except Exception as mongo_err:
        print(f"MongoDB integration bypassed (local JSON database active). Connection message: {mongo_err}")

    return True
