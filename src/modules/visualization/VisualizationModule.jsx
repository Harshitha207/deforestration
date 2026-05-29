import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, CircleMarker, Marker, Tooltip, Popup, useMap, useMapEvents, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { Search, Map as MapIcon, Globe, Calendar, ArrowRight, ShieldAlert, Loader, MapPin, TreePine, AlertTriangle, TrendingDown } from 'lucide-react';
import { regions, getHotspots } from '../../data/mockData';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red pin icon for clicked location
const clickedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Smoothly pan/zoom map when center or zoom changes (preventing feedback loops)
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const isSameCenter = Math.abs(currentCenter.lat - center[0]) < 0.0001 && Math.abs(currentCenter.lng - center[1]) < 0.0001;
    const isSameZoom = currentZoom === zoom;
    if (!isSameCenter || !isSameZoom) {
      map.setView(center, zoom, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Track user manual pan and zoom to update react state
function MapStateTracker({ setMapCenter, setMapZoom }) {
  useMapEvents({
    zoomend(e) {
      setMapZoom(e.target.getZoom());
    },
    moveend(e) {
      const center = e.target.getCenter();
      setMapCenter([center.lat, center.lng]);
    }
  });
  return null;
}

// Capture map click events
function MapClickEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Generate regular polygon resembling a circle
const generateCirclePolygon = (center, radiusInMeters, numPoints = 64) => {
  const coords = [];
  const lat = center[0];
  const lng = center[1];
  
  const latConv = 111320;
  const lngConv = 111320 * Math.cos(lat * Math.PI / 180);
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const dLat = (radiusInMeters * Math.sin(angle)) / latConv;
    const dLng = (radiusInMeters * Math.cos(angle)) / lngConv;
    coords.push([lng + dLng, lat + dLat]);
  }
  // Close the polygon
  coords.push(coords[0]);
  return {
    type: "Polygon",
    coordinates: [coords]
  };
};

// Extract Leaflet outer coordinates, calculate centroid, and compute inner scaled coordinates
const getLeafletCoordsAndCentroid = (geometry, deforestationPercent = 0) => {
  if (!geometry) return null;
  
  let centroid = [0, 0];
  let count = 0;
  
  if (geometry.type === 'Polygon') {
    const outerRing = geometry.coordinates[0];
    outerRing.forEach(([lng, lat]) => {
      centroid[0] += lat;
      centroid[1] += lng;
      count++;
    });
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(polygon => {
      const outerRing = polygon[0];
      outerRing.forEach(([lng, lat]) => {
        centroid[0] += lat;
        centroid[1] += lng;
        count++;
      });
    });
  }
  
  if (count === 0) return null;
  centroid = [centroid[0] / count, centroid[1] / count];
  
  // Outer coordinates
  let outerCoords = [];
  if (geometry.type === 'Polygon') {
    outerCoords = geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
  } else if (geometry.type === 'MultiPolygon') {
    outerCoords = geometry.coordinates.map(polygon => 
      polygon[0].map(([lng, lat]) => [lat, lng])
    );
  }
  
  // Scaled inner coordinates for deforestation
  const factor = Math.sqrt(deforestationPercent / 100);
  
  let innerCoords = [];
  if (geometry.type === 'Polygon') {
    innerCoords = outerCoords.map(([lat, lng]) => [
      centroid[0] + (lat - centroid[0]) * factor,
      centroid[1] + (lng - centroid[1]) * factor
    ]);
  } else if (geometry.type === 'MultiPolygon') {
    innerCoords = outerCoords.map(polygon => 
      polygon.map(([lat, lng]) => [
        centroid[0] + (lat - centroid[0]) * factor,
        centroid[1] + (lng - centroid[1]) * factor
      ])
    );
  }
  
  return { centroid, outerCoords, innerCoords };
};

// Calculate distance between two lat/lng points in meters (Haversine formula)
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Calculate circle radius from outer coordinates
const getRadiusInMeters = (centroid, outerCoords) => {
  if (!centroid || !outerCoords || outerCoords.length === 0) return 1500;
  let firstCoord = outerCoords[0];
  if (Array.isArray(firstCoord[0])) {
    firstCoord = firstCoord[0];
  }
  return getDistanceInMeters(centroid[0], centroid[1], firstCoord[0], firstCoord[1]);
};

// Generate deterministic points inside region representing forest and deforestation dots
const generateIndicatorDots = (centroid, outerCoords, forestPercent) => {
  if (!centroid || !outerCoords || outerCoords.length === 0) return [];
  const lat = centroid[0];
  const lng = centroid[1];
  const radiusInMeters = getRadiusInMeters(centroid, outerCoords);

  const latConv = 111320;
  const lngConv = 111320 * Math.cos(lat * Math.PI / 180);

  const totalDots = 800;
  const dots = [];

  // Seeded random generator using coordinates to keep dot distribution stable
  let seed = Math.abs(Math.floor(lat * 100000) + Math.floor(lng * 100000));
  const rand = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const greenCount = Math.round(totalDots * (forestPercent / 100));

  for (let i = 0; i < totalDots; i++) {
    // Polar coordinates for uniform distribution within a circle
    const r = radiusInMeters * Math.sqrt(rand());
    const theta = 2 * Math.PI * rand();

    const dLat = (r * Math.cos(theta)) / latConv;
    const dLng = (r * Math.sin(theta)) / lngConv;

    const dotLat = lat + dLat;
    const dotLng = lng + dLng;

    const isForest = i < greenCount;

    dots.push({
      lat: dotLat,
      lng: dotLng,
      type: isForest ? 'forest' : 'deforestation',
    });
  }

  return dots;
};

const BACKEND = '';

const VisualizationModule = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const incomingState = routerLocation.state || {};

  // Map view state
  const [mapCenter, setMapCenter] = useState([-3.4653, -62.2159]);
  const [mapZoom, setMapZoom] = useState(5);

  // Selected pin state
  const [selectedPin, setSelectedPin] = useState(null); // { lat, lng }
  const [activeRegionName, setActiveRegionName] = useState('Click anywhere on the map');

  // Search bar
  const [searchQuery, setSearchQuery] = useState(incomingState.location || '');

  // Year bounds
  const [yearStart, setYearStart] = useState(incomingState.startYear || 1995);
  const [yearEnd, setYearEnd] = useState(incomingState.endYear || 2026);

  const [typedStart, setTypedStart] = useState((incomingState.startYear || 1995).toString());
  const [typedEnd, setTypedEnd] = useState((incomingState.endYear || 2026).toString());

  useEffect(() => {
    setTypedStart(yearStart.toString());
  }, [yearStart]);

  useEffect(() => {
    setTypedEnd(yearEnd.toString());
  }, [yearEnd]);

  // Map layer type
  const [mapType, setMapType] = useState('normal');

  // Deforestation analysis result from backend
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Boundary geometry of the active region
  const [regionGeometry, setRegionGeometry] = useState(null);

  // On mount: if location passed from dashboard, search it. Otherwise restore from localStorage.
  useEffect(() => {
    if (incomingState.location) {
      handleGeoSearch(incomingState.location);
    } else {
      try {
        const saved = localStorage.getItem('deforestation_search_details');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedPin) setSelectedPin(parsed.selectedPin);
          if (parsed.activeRegionName) {
            setActiveRegionName(parsed.activeRegionName);
            setSearchQuery(parsed.activeRegionName);
          }
          if (parsed.yearStart) setYearStart(parsed.yearStart);
          if (parsed.yearEnd) setYearEnd(parsed.yearEnd);
          if (parsed.analysisData) setAnalysisData(parsed.analysisData);
          if (parsed.selectedPin) {
            setMapCenter(parsed.center || [parsed.selectedPin.lat, parsed.selectedPin.lng]);
            setMapZoom(parsed.zoom || 7);
            if (parsed.regionGeometry) {
              setRegionGeometry(parsed.regionGeometry);
            } else {
              setRegionGeometry(generateCirclePolygon([parsed.selectedPin.lat, parsed.selectedPin.lng], 1500));
            }
          }
        }
      } catch (e) {
        console.error("Error restoring state", e);
      }
    }
  }, []);

  // Save changes to localStorage whenever search state updates
  useEffect(() => {
    if (analysisData || selectedPin) {
      localStorage.setItem('deforestation_search_details', JSON.stringify({
        analysisData,
        activeRegionName,
        yearStart,
        yearEnd,
        selectedPin,
        regionGeometry,
        zoom: mapZoom,
        center: mapCenter,
        hasData: true
      }));
    }
  }, [analysisData, activeRegionName, yearStart, yearEnd, selectedPin, regionGeometry, mapZoom, mapCenter]);

  // Re-fetch analysis and update hotspots when years change
  useEffect(() => {
    if (selectedPin) {
      fetchAnalysis(activeRegionName, selectedPin.lat, selectedPin.lng);
    }
  }, [yearStart, yearEnd]);

  const saved = localStorage.getItem('deforestation_search_details');
  const hasData = saved ? (JSON.parse(saved).hasData || !!JSON.parse(saved).analysisData) : false;

  if (!hasData) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 40px', maxWidth: '560px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapIcon size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Map Visualization Offline</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '420px' }}>
            The interactive map and biosphere analysis will be generated once you enter a target location and start analysis on the <strong>Dashboard</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Fetch deforestation analysis from Flask backend ─────────────────────────
  const fetchAnalysis = async (locationName, lat, lng) => {
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisData(null);
    try {
      const res = await fetch(`${BACKEND}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locationName,
          start_year: yearStart,
          end_year: yearEnd,
          lat,
          lon: lng,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysisData(data);
    } catch (err) {
      setAnalysisError('Could not fetch analysis. Showing estimated data.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Map click handler: reverse geocode → fetch analysis ─────────────────────
  const handleMapClick = async (latlng) => {
    const { lat, lng } = latlng;
    setSelectedPin({ lat, lng });
    setMapCenter([lat, lng]);
    setActiveRegionName('Identifying region...');

    try {
      const res = await fetch(`${BACKEND}/api/reverse_geocode?lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const name = data?.display_name?.split(',')[0] || 'Selected Region';
      setActiveRegionName(name);
      setSearchQuery(name);
      
      if (data?.geojson && (data.geojson.type === 'Polygon' || data.geojson.type === 'MultiPolygon')) {
        setRegionGeometry(data.geojson);
      } else {
        setRegionGeometry(generateCirclePolygon([lat, lng], 1500));
      }
      
      fetchAnalysis(name, lat, lng);
    } catch {
      setActiveRegionName('Selected Region');
      setRegionGeometry(generateCirclePolygon([lat, lng], 1500));
      fetchAnalysis('Selected Region', lat, lng);
    }
  };

  const handleNavigate = () => {
    if (selectedPin) {
      fetchAnalysis(activeRegionName || 'Selected Region', selectedPin.lat, selectedPin.lng);
    }
  };

  // ─── Search bar: geocode → fly map → fetch analysis ──────────────────────────
  const handleGeoSearch = async (query) => {
    if (!query || query.trim().length < 4) {
      alert("Please enter a proper location.");
      return;
    }
    const lowerQuery = query.toLowerCase();

    // Fast local matches
    const localMatches = [
      { keywords: ['amazon', 'brazil'], center: [-3.4653, -62.2159], zoom: 5, name: 'Amazon Basin', radius: 450000 },
      { keywords: ['congo', 'africa'], center: [-0.2280, 22.2750], zoom: 6, name: 'Congo Basin', radius: 300000 },
      { keywords: ['borneo', 'indonesia', 'asia'], center: [0.9619, 114.5548], zoom: 6, name: 'Borneo / SE Asia', radius: 200000 },
      { keywords: ['india'], center: [22.9734, 78.6569], zoom: 6, name: 'Central India', radius: 150000 },
    ];

    for (const match of localMatches) {
      if (match.keywords.some(k => lowerQuery.includes(k))) {
        const [lat, lng] = match.center;
        setMapCenter(match.center);
        setMapZoom(match.zoom);
        setSelectedPin({ lat, lng });
        setActiveRegionName(match.name);
        setRegionGeometry(generateCirclePolygon([lat, lng], match.radius));
        fetchAnalysis(match.name, lat, lng);
        return;
      }
    }

    // Geocode via backend proxy
    try {
      const res = await fetch(`${BACKEND}/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const name = data[0].display_name.split(',')[0];
        setMapCenter([lat, lng]);
        setMapZoom(13); // Zoom closer to display the detailed boundary and name
        setSelectedPin({ lat, lng });
        setActiveRegionName(name);
        
        if (data[0].geojson && (data[0].geojson.type === 'Polygon' || data[0].geojson.type === 'MultiPolygon')) {
          setRegionGeometry(data[0].geojson);
        } else {
          setRegionGeometry(generateCirclePolygon([lat, lng], 1500));
        }
        
        fetchAnalysis(name, lat, lng);
      } else {
        alert("Please enter a proper location.");
      }
    } catch {
      alert('Search failed. Check if the backend server is running on port 5000.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleGeoSearch(searchQuery);
  };

  // ─── Fallback mock stats for display when API unavailable ───────────────────
  const getMockDeltas = () => {
    let closestReg = regions[0];
    let minD = Infinity;
    regions.forEach(r => {
      const d = Math.pow(r.center[0] - mapCenter[0], 2) + Math.pow(r.center[1] - mapCenter[1], 2);
      if (d < minD) { minD = d; closestReg = r; }
    });
    const sA = closestReg.statistics.find(s => s.year === yearStart) || { forestCover: 400000, activeAlerts: 10 };
    const sB = closestReg.statistics.find(s => s.year === yearEnd) || { forestCover: 370000, activeAlerts: 90 };
    const loss = sA.forestCover - sB.forestCover;
    return {
      startCover: sA.forestCover,
      endCover: sB.forestCover,
      loss,
      percentage: ((loss / sA.forestCover) * 100).toFixed(1),
      alerts: Math.round((sA.activeAlerts + sB.activeAlerts) / 2),
    };
  };

  const mockDeltas = getMockDeltas();

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* ── MAP AREA ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', background: '#0a0e17', cursor: 'crosshair' }}
          zoomControl={false}
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <MapStateTracker setMapCenter={setMapCenter} setMapZoom={setMapZoom} />
          {/* Map click events are disabled to keep visualization static */}

          {/* Tile layers */}
          {mapType === 'normal' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
              maxNativeZoom={18}
            />
          )}

          {/* Selected location pin */}
          {selectedPin && (
            <Marker position={[selectedPin.lat, selectedPin.lng]}>
              <Popup>
                <div style={{ fontSize: '0.85rem', minWidth: '160px' }}>
                  <strong>{activeRegionName}</strong><br />
                  <span style={{ color: '#555' }}>
                    {selectedPin.lat.toFixed(4)}° N, {selectedPin.lng.toFixed(4)}° E
                  </span><br />
                  <span style={{ color: '#c00' }}>Click "Navigate" or click map to analyse.</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Boundary Polygons representing Deforestation/Region Boundary (Red) and Forest/Deforestation Dots */}
          {(() => {
            const polyData = regionGeometry ? getLeafletCoordsAndCentroid(regionGeometry, analysisData ? analysisData.deforestation_percent : 15) : null;
            if (!polyData) return null;

            const forestPercent = analysisData ? analysisData.forest_percent : 85;
            const deforestationPercent = analysisData ? analysisData.deforestation_percent : 15;
            const dots = generateIndicatorDots(polyData.centroid, polyData.outerCoords, forestPercent);
            
            const radiusInMeters = getRadiusInMeters(polyData.centroid, polyData.outerCoords);

            return (
              <>
                {/* Outer Circular Boundary representing the specified region (rendered invisible to attach the permanent tooltip) */}
                <Circle
                  center={polyData.centroid}
                  radius={radiusInMeters}
                  pathOptions={{
                    stroke: false,
                    fillOpacity: 0,
                  }}
                >
                  <Tooltip permanent direction="center" className="region-map-tooltip">
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(22, 101, 52, 0.5)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                      whiteSpace: 'nowrap',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {activeRegionName}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                        Forest Coverage: {forestPercent.toFixed(1)}%
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.7)' }}>
                        Deforestation Loss: {deforestationPercent.toFixed(1)}%
                      </span>
                    </div>
                  </Tooltip>
                </Circle>

                {/* Dots representing Forest Cover (Dark Green) and Deforestation (Red) */}
                {dots.map((dot, index) => (
                  <CircleMarker
                    key={`dot-${index}`}
                    center={[dot.lat, dot.lng]}
                    radius={3.2}
                    pathOptions={{
                      color: dot.type === 'forest' ? '#14532d' : '#7f1d1d', // Dark Green outline vs dark red outline
                      fillColor: dot.type === 'forest' ? '#166534' : '#ef4444', // Dark Green fill vs Red fill
                      fillOpacity: 0.95,
                      weight: 0.5,
                    }}
                  />
                ))}
              </>
            );
          })()}
        </MapContainer>

        {/* ── TOP CONTROL BAR ─────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px', right: '16px',
          zIndex: 1000, display: 'flex', gap: '12px', flexWrap: 'wrap',
        }}>
          {/* Search (Static/Read-only text) */}
          <div className="glass-panel"
            style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', flex: 1, minWidth: '260px', cursor: 'default' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
              {searchQuery || "Search any region or country..."}
            </span>
          </div>

          {/* Year selectors (Static/Read-only text) */}
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', cursor: 'default' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
              {yearStart}
            </span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
              {yearEnd}
            </span>
          </div>

          {/* Map type toggle */}
          <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '4px' }}>
            {['normal', 'satellite'].map(type => (
              <button key={type} className="btn"
                onClick={() => setMapType(type)}
                style={{
                  padding: '6px 12px', fontSize: '0.78rem', borderRadius: '6px', border: 'none',
                  background: mapType === type ? 'var(--accent-primary)' : 'transparent',
                  color: mapType === type ? '#fff' : 'var(--text-secondary)',
                  textTransform: 'capitalize',
                }}>
                {type === 'normal' ? <><MapIcon size={13} style={{ marginRight: '5px' }} />Normal</> : <><Globe size={13} style={{ marginRight: '5px' }} />Satellite</>}
              </button>
            ))}
          </div>
        </div>

        {/* Click hint */}
        {!selectedPin && (
          <div style={{
            position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: 'rgba(0,0,0,0.65)', color: '#fff',
            padding: '8px 20px', borderRadius: '20px', fontSize: '0.82rem',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}>
            🖱 Click anywhere on the map to select a region and get deforestation analysis
          </div>
        )}
      </div>

      {/* ── RIGHT STATS PANEL ────────────────────────────────────────────── */}
      <div style={{
        width: '360px', height: '100%', borderLeft: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', padding: '20px', display: 'flex',
        flexDirection: 'column', gap: '16px', overflowY: 'auto',
      }}>

        {/* Region header */}
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.08em' }}>
            Selected Region
          </span>
          <h2 style={{ fontSize: '1.2rem', marginTop: '4px', lineHeight: 1.3 }}>{activeRegionName}</h2>
          {selectedPin && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <MapPin size={11} style={{ marginRight: '4px' }} />{selectedPin.lat.toFixed(4)}° N, {selectedPin.lng.toFixed(4)}° E
            </p>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '12px', padding: '32px 0', color: 'var(--text-secondary)',
          }}>
            <Loader size={32} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.85rem' }}>Fetching deforestation data...</span>
          </div>
        )}

        {/* Error notice */}
        {!isLoading && analysisError && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.78rem', color: 'var(--danger)',
          }}>
            ⚠ {analysisError}
          </div>
        )}

        {/* ── REAL DATA from backend ──────────────────────────────────────── */}
        {!isLoading && analysisData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Forest & deforestation percentage */}
            <div className="glass-card flex-col" style={{ padding: '14px', gap: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <TreePine size={11} style={{ marginRight: '4px' }} />Forest Coverage
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>
                {analysisData.forest_percent?.toFixed(1)}%
              </h3>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analysisData.forest_percent}%`, background: '#22c55e', borderRadius: '3px' }} />
              </div>
            </div>

            {(() => {
              const isDenseForest = analysisData.forest_percent >= 80.0;
              const defPercent = analysisData.deforestation_percent ?? 0;
              
              let defCardColor = 'var(--danger)';
              let defCardBg = 'rgba(239, 68, 68, 0.04)';
              let defCardBorder = '3px solid var(--danger)';
              
              if (isDenseForest || defPercent < 20.0) {
                defCardColor = 'var(--success)';
                defCardBg = 'rgba(34, 197, 94, 0.04)';
                defCardBorder = '3px solid var(--success)';
              } else if (defPercent < 50.0) {
                defCardColor = 'var(--warning)';
                defCardBg = 'rgba(245, 158, 11, 0.04)';
                defCardBorder = '3px solid var(--warning)';
              }

              return (
                <div className="glass-card flex-col" style={{ padding: '14px', gap: '6px', borderLeft: defCardBorder, background: defCardBg }}>
                  <span style={{ fontSize: '0.7rem', color: defCardColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <TrendingDown size={11} style={{ marginRight: '4px' }} />Deforestation Rate
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: defCardColor }}>
                    {defPercent.toFixed(1)}%
                  </h3>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${defPercent}%`, background: defCardColor, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })()}

            {/* NDVI */}
            <div className="glass-card flex-col" style={{ padding: '14px', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NDVI (Vegetation Index)</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#a3e635' }}>
                {analysisData.ndvi?.toFixed(2)}
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {analysisData.ndvi > 0.6 ? 'Dense vegetation canopy' : analysisData.ndvi > 0.3 ? 'Moderate vegetation density' : 'Sparse / degraded cover'}
              </span>
            </div>


            {/* Alert */}
            {(() => {
              const defPercent = analysisData.deforestation_percent ?? 0;
              let alertBg = 'rgba(34, 197, 94, 0.1)';
              let alertBorder = '1px solid rgba(34, 197, 94, 0.3)';
              let alertColor = 'var(--success)';
              let alertTitle = '✓ NOMINAL: Stable canopy';
              let alertMsg = 'Forest cover and vegetation index remain within safe, stable ecological thresholds.';
              let mitigation = [
                'Maintain standard periodic orbit pass tracking schedule',
                'Archive database analysis to standard logs registry'
              ];

              if (defPercent >= 20.0) {
                alertBg = 'rgba(239, 68, 68, 0.1)';
                alertBorder = '1px solid rgba(239, 68, 68, 0.3)';
                alertColor = 'var(--danger)';
                alertTitle = '⚠️ ALERT: High tree loss detected!';
                alertMsg = 'This area has lost a lot of trees recently. We need to take action to protect the remaining forest.';
                mitigation = [
                  'Deploy emergency satellite ground patrol telemetry',
                  'Execute local government logging moratorium protocol',
                  'Initiate urgent multi-spectral NDVI re-scanning pass'
                ];
              } else if (defPercent > 10.0) {
                alertBg = 'rgba(245, 158, 11, 0.1)';
                alertBorder = '1px solid rgba(245, 158, 11, 0.3)';
                alertColor = 'var(--warning)';
                alertTitle = '⚠️ WARNING: Tree cover is decreasing';
                alertMsg = 'We should monitor this area closely to prevent further loss.';
                mitigation = [
                  'Flag coordinates for subsequent Sentinel acquisition orbits',
                  'Conduct ground audit verification on biosphere borders',
                  'Review commercial land development logging permits'
                ];
              }

              return (
                <div style={{
                  padding: '12px 14px', borderRadius: '8px',
                  background: alertBg,
                  border: alertBorder,
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px', color: alertColor }}>
                    {alertTitle}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '6px' }}>
                    {alertMsg}
                  </p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Recommended Mitigation:</span>
                    <ul style={{ margin: '4px 0 0 14px', padding: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {mitigation.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ── FALLBACK MOCK STATS (before click or on API error) ──────────── */}
        {!isLoading && !analysisData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {!selectedPin
                ? 'Click any location on the map to instantly fetch real deforestation analysis for that region.'
                : 'Showing deterministic biosphere estimate for this location.'}
            </p>

            <div className="glass-card flex-col" style={{ padding: '14px', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Forest cover in {yearStart}</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{mockDeltas.startCover.toLocaleString()} km²</h3>
            </div>
            <div className="glass-card flex-col" style={{ padding: '14px', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Forest cover in {yearEnd}</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{mockDeltas.endCover.toLocaleString()} km²</h3>
            </div>
            <div className="glass-card flex-col" style={{ padding: '14px', gap: '4px', borderLeft: '3px solid var(--danger)', background: 'rgba(239,68,68,0.02)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Net Loss ({yearStart}–{yearEnd})</span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--danger)', fontWeight: 700 }}>-{mockDeltas.loss.toLocaleString()} km²</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Estimated: -{mockDeltas.percentage}% canopy reduction</span>
            </div>
          </div>
        )}


      </div>

      {/* Inline styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .region-map-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .region-map-tooltip::before {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default VisualizationModule;
