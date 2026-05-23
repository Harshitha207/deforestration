from flask import Flask, render_template, request, jsonify
import json
import os

from deforestation import analyze_deforestation
from prediction import predict_future
from alerts import generate_alert
from database import save_analysis
from visualization import create_chart_data

app = Flask(__name__)

# ==========================================
# CORS CORS-Enable Injection
# ==========================================
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ==========================================
# HOME
# ==========================================
@app.route('/')
def home():
    return render_template(
        'home.html'
    )

# ==========================================
# DASHBOARD
# ==========================================
@app.route('/dashboard')
def dashboard():
    return render_template(
        'dashboard.html'
    )

# ==========================================
# REPORTS
# ==========================================
@app.route('/reports')
def reports():
    return render_template(
        'reports.html'
    )

# ==========================================
# CHARTS
# ==========================================
@app.route('/charts')
def charts():
    return render_template(
        'charts.html'
    )

# ==========================================
# ABOUT
# ==========================================
@app.route('/about')
def about():
    return render_template(
        'about.html'
    )

# ==========================================
# ANALYZE API
# ==========================================
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # ==================================
        # GET DATA
        # ==================================
        data = request.get_json() or {}
        location = data.get('location', 'Amazon Basin')
        start_year = int(data.get('start_year', 1995))
        end_year = int(data.get('end_year', 2026))
        lat = data.get('lat')
        lon = data.get('lon')

        # ==================================
        # MAIN ANALYSIS
        # ==================================
        result = analyze_deforestation(
            location,
            start_year,
            end_year,
            lat=lat,
            lon=lon
        )

        # ==================================
        # GET VALUES
        # ==================================
        forest_percent = result['forest_percent']
        deforestation_percent = result['deforestation_percent']
        ndvi = result['ndvi']
        tile_url = result['tile_url']
        lat = result['lat']
        lon = result['lon']

        period_loss_rate = result.get('period_loss_rate', deforestation_percent)

        # ==================================
        # FUTURE PREDICTION
        # ==================================
        future = predict_future(period_loss_rate, end_year=end_year)

        # ==================================
        # ALERT SYSTEM
        # ==================================
        alert = generate_alert(period_loss_rate, forest_percent=forest_percent)


        # ==================================
        # SAVE HISTORY
        # ==================================
        save_analysis({
            "location": location,
            "forest": forest_percent,
            "deforestation": deforestation_percent,
            "ndvi": ndvi,
            "period_loss_rate": period_loss_rate,
            "alert": alert
        })

        # ==================================
        # CHART DATA
        # ==================================
        chart_data = create_chart_data(
            forest_percent,
            deforestation_percent
        )

        # ==================================
        # FINAL RESPONSE
        # ==================================
        return jsonify({
            "forest_percent": forest_percent,
            "deforestation_percent": deforestation_percent,
            "ndvi": ndvi,
            "tile_url": tile_url,
            "lat": lat,
            "lon": lon,
            "future_prediction": future,
            "alert": alert,
            "chart_data": chart_data
        })

    # ======================================
    # ERROR HANDLING
    # ======================================
    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "forest_percent": 0,
            "deforestation_percent": 0,
            "ndvi": 0,
            "tile_url": "",
            "lat": 0,
            "lon": 0,
            "error": str(e)
        })

# ==========================================
# ADDITIONAL LOGS GET API
# ==========================================
@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        db_path = '/tmp/db_audit_logs.json'
        if os.path.exists(db_path):
            with open(db_path, 'r') as f:
                logs = json.load(f)
            return jsonify(logs)
        return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)})

# ==========================================
# ADDITIONAL LOGS CLEAR API
# ==========================================
@app.route('/api/logs/clear', methods=['POST'])
def clear_logs():
    try:
        db_path = '/tmp/db_audit_logs.json'
        with open(db_path, 'w') as f:
            json.dump([], f)
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"error": str(e)})

# ==========================================
# ADDITIONAL LOGS DELETE API
# ==========================================
@app.route('/api/logs/<int:log_id>', methods=['DELETE'])
def delete_log(log_id):
    try:
        db_path = '/tmp/db_audit_logs.json'
        if os.path.exists(db_path):
            with open(db_path, 'r') as f:
                logs = json.load(f)
            logs = [log for log in logs if log.get('id') != log_id]
            with open(db_path, 'w') as f:
                json.dump(logs, f, indent=2)
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"error": str(e)})

# ==========================================
# PROXY GEOCODING API
# ==========================================
LOCAL_LOCATIONS = {
    "kadabgere cross": {
        "lat": "12.9760",
        "lon": "77.4254",
        "display_name": "Kadabagere Cross, Magadi Road, Bengaluru, Karnataka, 562130, India"
    },
    "kadabagere cross": {
        "lat": "12.9760",
        "lon": "77.4254",
        "display_name": "Kadabagere Cross, Magadi Road, Bengaluru, Karnataka, 562130, India"
    },
    "kadabgere": {
        "lat": "12.9760",
        "lon": "77.4254",
        "display_name": "Kadabagere, Magadi Road, Bengaluru, Karnataka, 562130, India"
    },
    "kadabagere": {
        "lat": "12.9760",
        "lon": "77.4254",
        "display_name": "Kadabagere, Magadi Road, Bengaluru, Karnataka, 562130, India"
    },
    "anjana nagar": {
        "lat": "12.9902",
        "lon": "77.5041",
        "display_name": "Anjana Nagar, Bengaluru, Karnataka, 560091, India"
    },
    "anjananagar": {
        "lat": "12.9902",
        "lon": "77.5041",
        "display_name": "Anjana Nagar, Bengaluru, Karnataka, 560091, India"
    },
    "anjana": {
        "lat": "12.9902",
        "lon": "77.5041",
        "display_name": "Anjana Nagar, Bengaluru, Karnataka, 560091, India"
    },
    "herohalli": {
        "lat": "12.9922",
        "lon": "77.4876",
        "display_name": "Herohalli, Bengaluru, Karnataka, 560091, India"
    },
    "hegganahalli": {
        "lat": "12.9984",
        "lon": "77.5147",
        "display_name": "Hegganahalli, Bengaluru, Karnataka, 560091, India"
    },
    "bylakonenahalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "bylakonenehalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "bylakone nahalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "byalakonenahalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "byalakonenehalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "bylakonahalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "byalakonahalli": {
        "lat": "13.0110",
        "lon": "77.4599",
        "display_name": "Bylakonenahalli, Bengaluru North, Bengaluru Urban, Karnataka, 562130, India"
    },
    "ligadeeranahalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "ligadheeranahalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "lingadeeranahalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "lingadheeranahalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "ligadeeranhalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "ligadheeranhalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "lingadeeranhalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
    "lingadheeranhalli": {
        "lat": "12.8783",
        "lon": "77.5330",
        "display_name": "Lingadheeranahalli, Bengaluru South, Bengaluru Urban, Karnataka, 560062, India"
    },
}

@app.route('/api/geocode', methods=['GET'])
def geocode():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify([])
            
        import requests
        headers = {
            'User-Agent': 'TerraGuard Deforestation Engine v8.0.13 (contact: admin@terraguard.org)'
        }
        
        norm_query = query.lower().strip()
        
        # 1. Check local cache FIRST on original query to prevent broad normalization overrides
        matched_loc = None
        for key, val in LOCAL_LOCATIONS.items():
            if key in norm_query:
                matched_loc = val
                break
                
        # 2. Normalize common spelling variants of Bangalore and Mysore ONLY if query specifically refers only to the city
        if not matched_loc:
            words = set(w.strip(',.') for w in norm_query.split())
            bangalore_words = {'bangalore', 'bengaluru', 'blr', 'bangl', 'bengl', 'karnataka', 'india', 'city'}
            mysore_words = {'mysore', 'mysuru', 'mysur', 'myso', 'karnataka', 'india', 'city'}
            
            if words.issubset(bangalore_words) and any(w in words for w in ['bangalore', 'bengaluru', 'blr', 'bangl', 'bengl']):
                query = "Bengaluru, Karnataka, India"
                norm_query = "bengaluru, karnataka, india"
            elif words.issubset(mysore_words) and any(w in words for w in ['mysore', 'mysuru', 'mysur', 'myso']):
                query = "Mysuru, Karnataka, India"
                norm_query = "mysuru, karnataka, india"
                
        if matched_loc:
            lat_f = float(matched_loc["lat"])
            lon_f = float(matched_loc["lon"])
            return jsonify([{
                "place_id": 999999,
                "licence": "Local Cache",
                "osm_type": "node",
                "osm_id": 999999,
                "boundingbox": [
                    str(lat_f - 0.01),
                    str(lat_f + 0.01),
                    str(lon_f - 0.01),
                    str(lon_f + 0.01)
                ],
                "lat": matched_loc["lat"],
                "lon": matched_loc["lon"],
                "display_name": matched_loc["display_name"],
                "class": "place",
                "type": "suburb",
                "importance": 0.9,
                "geojson": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lon_f - 0.015, lat_f - 0.015],
                        [lon_f - 0.015, lat_f + 0.015],
                        [lon_f + 0.015, lat_f + 0.015],
                        [lon_f + 0.015, lat_f - 0.015],
                        [lon_f - 0.015, lat_f - 0.015]
                    ]]
                }
            }])
            
        # Try internet geocoding with Nominatim
        try:
            url = f"https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q={requests.utils.quote(query)}"
            resp = requests.get(url, headers=headers, timeout=5)
            results = resp.json()
            if results and len(results) > 0:
                return jsonify(results)
        except Exception as e:
            print("Nominatim request error:", e)
            
        # If Nominatim fails or returns nothing, we return an empty list so the frontend can show an error
        return jsonify([])
    except Exception as e:
        print("Geocoding service error:", e)
        return jsonify([])

# ==========================================
# PROXY REVERSE GEOCODING API
# ==========================================
@app.route('/api/reverse_geocode', methods=['GET'])
def reverse_geocode():
    try:
        lat = request.args.get('lat', '')
        lon = request.args.get('lon', '')
        if not lat or not lon:
            return jsonify({})
            
        import requests
        headers = {
            'User-Agent': 'TerraGuard Deforestation Engine v8.0.13 (contact: admin@terraguard.org)'
        }
            
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&polygon_geojson=1&lat={lat}&lon={lon}"
        resp = requests.get(url, headers=headers, timeout=5)
        return jsonify(resp.json())
    except Exception as e:
        print("Reverse Geocoding service error:", e)
        return jsonify({})

# ==========================================
# RUN SERVER
# ==========================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
