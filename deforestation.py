import math

# Region constants similar to the mockData.js coordinates and characteristics
REGIONS = {
    "amazon": {
        "name": "Amazon Basin",
        "center": [-3.4653, -62.2159],
        "initial_cover": 5260000.0,
        "loss_trend": 18000.0,
        "sin_factor": 1.5,
        "sin_amp": 5000.0
    },
    "congo": {
        "name": "Congo Basin",
        "center": [-0.2280, 22.2758],
        "initial_cover": 1780000.0,
        "loss_trend": 5000.0,
        "cos_factor": 1.2,
        "cos_amp": 2000.0
    },
    "southeast-asia": {
        "name": "Southeast Asia (Borneo)",
        "center": [0.9619, 114.5548],
        "initial_cover": 737000.0,
        "loss_trend": 8000.0,
        "sin_factor": 2.0,
        "sin_amp": 1500.0
    },
    "central-india": {
        "name": "Deciduous Forests (Central India)",
        "center": [22.9734, 78.6569],
        "initial_cover": 350000.0,
        "loss_trend": 1500.0,
        "sin_factor": 0.8,
        "sin_amp": 1000.0
    }
}

def sin_hash(lat, lon):
    """Deterministic sine-based hash multiplier to yield repeatable pseudo-random values [0, 1]."""
    val = math.sin(float(lat) * 12.9898 + float(lon) * 78.233) * 43758.5453
    return val - math.floor(val)

def check_is_urban(location, lat, lon):
    """Detects whether a location is urban (e.g. Bangalore and its neighborhoods)."""
    loc_lower = str(location).lower()
    urban_keywords = [
        "bengaluru", "bangalore", "nagar", "halli", "pura", "layout", 
        "colony", "kengeri", "peenya", "herohalli", "gangodanahalli", 
        "yeshwanthpur", "malleshwaram", "jayanagar", "jp nagar", 
        "koramangala", "whitefield", "indiranagar", "marathahalli", 
        "hebbal", "city", "town", "urban", "metropolitan", "suburb",
        "mumbai", "delhi", "chennai", "kolkata", "hyderabad", "pune"
    ]
    if any(k in loc_lower for k in urban_keywords):
        return True
        
    if lat is not None and lon is not None:
        try:
            lat_f = float(lat)
            lon_f = float(lon)
            if 12.8 <= lat_f <= 13.15 and 77.4 <= lon_f <= 77.8:
                return True
        except ValueError:
            pass
    return False

def analyze_deforestation(location, start_year, end_year, lat=None, lon=None):
    """
    Simulates spatiotemporal band calculations.
    Supports preset biospheres or deterministic localized coordinate calculation mapping.
    """
    # Normalize location lookup
    loc_key = None
    loc_lower = str(location).lower()
    for key, data in REGIONS.items():
        if key in loc_lower or data["name"].lower() in loc_lower or loc_lower in data["name"].lower():
            loc_key = key
            break

    start_diff = max(0, start_year - 1995)
    end_diff = max(0, end_year - 1995)

    if loc_key:
        region = REGIONS[loc_key]
        calc_lat, calc_lon = region["center"]
        
        if loc_key == "amazon":
            base_forest = 92.0
            decay_rate = 0.35
            event_year = 2019
            event_magnitude = 2.8
            total_area = 5260000.0
            
            pct_start = base_forest - decay_rate * start_diff
            if start_year >= event_year: pct_start -= event_magnitude
            pct_start += math.sin(start_year * 1.3) * 0.3 + math.cos(start_year * 3.1) * 0.12
            forest_percent_start = max(2.0, min(95.0, pct_start))
            
            pct_end = base_forest - decay_rate * end_diff
            if end_year >= event_year: pct_end -= event_magnitude
            pct_end += math.sin(end_year * 1.3) * 0.3 + math.cos(end_year * 3.1) * 0.12
            forest_percent_end = max(2.0, min(95.0, pct_end))
            
        elif loc_key == "congo":
            base_forest = 90.0
            decay_rate = 0.25
            event_year = 2016
            event_magnitude = 1.9
            total_area = 1780000.0
            
            pct_start = base_forest - decay_rate * start_diff
            if start_year >= event_year: pct_start -= event_magnitude
            pct_start += math.cos(start_year * 1.1) * 0.25 + math.sin(start_year * 2.8) * 0.1
            forest_percent_start = max(2.0, min(95.0, pct_start))
            
            pct_end = base_forest - decay_rate * end_diff
            if end_year >= event_year: pct_end -= event_magnitude
            pct_end += math.cos(end_year * 1.1) * 0.25 + math.sin(end_year * 2.8) * 0.1
            forest_percent_end = max(2.0, min(95.0, pct_end))
            
        elif loc_key == "southeast-asia":
            base_forest = 80.0
            decay_rate = 0.50
            event_year = 2015
            event_magnitude = 4.2
            total_area = 737000.0
            
            pct_start = base_forest - decay_rate * start_diff
            if start_year >= event_year: pct_start -= event_magnitude
            pct_start += math.sin(start_year * 1.8) * 0.35 + math.cos(start_year * 4.2) * 0.15
            forest_percent_start = max(2.0, min(95.0, pct_start))
            
            pct_end = base_forest - decay_rate * end_diff
            if end_year >= event_year: pct_end -= event_magnitude
            pct_end += math.sin(end_year * 1.8) * 0.35 + math.cos(end_year * 4.2) * 0.15
            forest_percent_end = max(2.0, min(95.0, pct_end))
            
        else: # central-india
            base_forest = 62.0
            decay_rate = 0.30
            event_year = 2012
            event_magnitude = 2.1
            total_area = 350000.0
            
            pct_start = base_forest - decay_rate * start_diff
            if start_year >= event_year: pct_start -= event_magnitude
            pct_start += math.sin(start_year * 0.9) * 0.3 + math.cos(start_year * 2.5) * 0.1
            forest_percent_start = max(2.0, min(95.0, pct_start))
            
            pct_end = base_forest - decay_rate * end_diff
            if end_year >= event_year: pct_end -= event_magnitude
            pct_end += math.sin(end_year * 0.9) * 0.3 + math.cos(end_year * 2.5) * 0.1
            forest_percent_end = max(2.0, min(95.0, pct_end))

    else:
        calc_lat = float(lat) if lat is not None else 12.9716
        calc_lon = float(lon) if lon is not None else 77.5946
        
        seed = abs(sin_hash(calc_lat, calc_lon))
        equator_proximity = max(0.0, 1.0 - (abs(calc_lat) / 60.0))
        total_area = 7.07 # 1.5km circle area in km2

        is_urban = check_is_urban(location, calc_lat, calc_lon)
        is_declining = True
        event_year = 2005 + int(seed * 15)
        event_magnitude = 1.5 + seed * 2.5

        if is_urban:
            base_forest = 14.0 + seed * 8.0 # 14% to 22%
            decay_rate = 0.12 + seed * 0.08
            growth_rate = 0.06 + seed * 0.08
        else:
            base_forest = 30.0 + 35.0 * equator_proximity + (seed - 0.5) * 10.0 # 25% to 75%
            decay_rate = 0.25 + seed * 0.25
            growth_rate = 0.10 + seed * 0.15

        pct_start = base_forest
        if is_declining:
            pct_start -= decay_rate * start_diff
            if start_year >= event_year:
                pct_start -= event_magnitude
        else:
            pct_start += growth_rate * start_diff
            if start_year >= event_year:
                pct_start += event_magnitude
        noise_start = math.sin(start_year * 1.7 + seed * 5) * 0.45 + math.cos(start_year * 3.8) * 0.18 + math.sin(start_year * 0.6) * 0.25
        pct_start += noise_start
        forest_percent_start = max(2.0, min(95.0, pct_start))

        pct_end = base_forest
        if is_declining:
            pct_end -= decay_rate * end_diff
            if end_year >= event_year:
                pct_end -= event_magnitude
        else:
            pct_end += growth_rate * end_diff
            if end_year >= event_year:
                pct_end += event_magnitude
        noise_end = math.sin(end_year * 1.7 + seed * 5) * 0.45 + math.cos(end_year * 3.8) * 0.18 + math.sin(end_year * 0.6) * 0.25
        pct_end += noise_end
        forest_percent_end = max(2.0, min(95.0, pct_end))

    start_cover = (forest_percent_start / 100.0) * total_area
    end_cover = (forest_percent_end / 100.0) * total_area

    # Calculate absolute forest coverage and deforestation percentages
    forest_percent = forest_percent_end
    deforestation_percent = 100.0 - forest_percent

    # Calculate period loss rate (percentage of starting forest cover that was lost)
    if forest_percent_start > 0:
        period_loss_rate = ((forest_percent_start - forest_percent_end) / forest_percent_start) * 100.0
    else:
        period_loss_rate = 0.0
    period_loss_rate = max(0.1, min(95.0, period_loss_rate))

    # Calculate physical net loss in km2
    net_loss = max(0.0, start_cover - end_cover)

    # NDVI aligns dynamically with the absolute remaining forest percent
    ndvi = 0.15 + 0.72 * (forest_percent / 100.0)
    ndvi = max(0.15, min(0.9, ndvi))

    tile_url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

    return {
        "forest_percent": round(forest_percent, 1),
        "deforestation_percent": round(deforestation_percent, 2),
        "period_loss_rate": round(period_loss_rate, 2),
        "ndvi": round(ndvi, 2),
        "tile_url": tile_url,
        "lat": calc_lat,
        "lon": calc_lon,
        "net_loss": round(net_loss, 2)
    }

