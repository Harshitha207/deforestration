import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingDown, TreePine, Eye, AlertTriangle, ArrowLeft, 
  Calendar, MapPin, ShieldAlert, Sparkles, Activity, Layers
} from 'lucide-react';

// Spatiotemporal band/cover simulation to align perfectly with deforestation.py
const checkIsUrban = (location, lat, lon) => {
  const locLower = String(location).toLowerCase();
  const urbanKeywords = [
    "bengaluru", "bangalore", "nagar", "halli", "pura", "layout", 
    "colony", "kengeri", "peenya", "herohalli", "gangodanahalli", 
    "yeshwanthpur", "malleshwaram", "jayanagar", "jp nagar", 
    "koramangala", "whitefield", "indiranagar", "marathahalli", 
    "hebbal", "city", "town", "urban", "metropolitan", "suburb",
    "mumbai", "delhi", "chennai", "kolkata", "hyderabad", "pune"
  ];
  if (urbanKeywords.some(k => locLower.includes(k))) return true;
  
  if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    if (latF >= 12.8 && latF <= 13.15 && lonF >= 77.4 && lonF <= 77.8) {
      return true;
    }
  }
  return false;
};

const getSpatiotemporalForestCover = (lat, lon, startYear, endYear, activeRegionName) => {
  const locLower = String(activeRegionName).toLowerCase();
  const startDiff = Math.max(0, startYear - 1995);
  const endDiff = Math.max(0, endYear - 1995);
  
  let totalArea = 7.07;
  let forestPercentStart = 0;
  let forestPercentEnd = 0;

  if (locLower.includes('amazon')) {
    totalArea = 5260000.0;
    const baseForest = 92.0;
    const decayRate = 0.35;
    const eventYear = 2019;
    const eventMagnitude = 2.8;
    
    const pctStart = baseForest - decayRate * startDiff;
    const finalPctStart = startYear >= eventYear ? pctStart - eventMagnitude : pctStart;
    forestPercentStart = finalPctStart + Math.sin(startYear * 1.3) * 0.3 + Math.cos(startYear * 3.1) * 0.12;
    forestPercentStart = Math.max(2.0, Math.min(95.0, forestPercentStart));
    
    const pctEnd = baseForest - decayRate * endDiff;
    const finalPctEnd = endYear >= eventYear ? pctEnd - eventMagnitude : pctEnd;
    forestPercentEnd = finalPctEnd + Math.sin(endYear * 1.3) * 0.3 + Math.cos(endYear * 3.1) * 0.12;
    forestPercentEnd = Math.max(2.0, Math.min(95.0, forestPercentEnd));
  } else if (locLower.includes('congo')) {
    totalArea = 1780000.0;
    const baseForest = 90.0;
    const decayRate = 0.25;
    const eventYear = 2016;
    const eventMagnitude = 1.9;
    
    const pctStart = baseForest - decayRate * startDiff;
    const finalPctStart = startYear >= eventYear ? pctStart - eventMagnitude : pctStart;
    forestPercentStart = finalPctStart + Math.cos(startYear * 1.1) * 0.25 + Math.sin(startYear * 2.8) * 0.1;
    forestPercentStart = Math.max(2.0, Math.min(95.0, forestPercentStart));
    
    const pctEnd = baseForest - decayRate * endDiff;
    const finalPctEnd = endYear >= eventYear ? pctEnd - eventMagnitude : pctEnd;
    forestPercentEnd = finalPctEnd + Math.cos(endYear * 1.1) * 0.25 + Math.sin(endYear * 2.8) * 0.1;
    forestPercentEnd = Math.max(2.0, Math.min(95.0, forestPercentEnd));
  } else if (locLower.includes('borneo') || locLower.includes('asia') || locLower.includes('southeast')) {
    totalArea = 737000.0;
    const baseForest = 80.0;
    const decayRate = 0.50;
    const eventYear = 2015;
    const eventMagnitude = 4.2;
    
    const pctStart = baseForest - decayRate * startDiff;
    const finalPctStart = startYear >= eventYear ? pctStart - eventMagnitude : pctStart;
    forestPercentStart = finalPctStart + Math.sin(startYear * 1.8) * 0.35 + Math.cos(startYear * 4.2) * 0.15;
    forestPercentStart = Math.max(2.0, Math.min(95.0, forestPercentStart));
    
    const pctEnd = baseForest - decayRate * endDiff;
    const finalPctEnd = endYear >= eventYear ? pctEnd - eventMagnitude : pctEnd;
    forestPercentEnd = finalPctEnd + Math.sin(endYear * 1.8) * 0.35 + Math.cos(endYear * 4.2) * 0.15;
    forestPercentEnd = Math.max(2.0, Math.min(95.0, forestPercentEnd));
  } else if (locLower.includes('india')) {
    totalArea = 350000.0;
    const baseForest = 62.0;
    const decayRate = 0.30;
    const eventYear = 2012;
    const eventMagnitude = 2.1;
    
    const pctStart = baseForest - decayRate * startDiff;
    const finalPctStart = startYear >= eventYear ? pctStart - eventMagnitude : pctStart;
    forestPercentStart = finalPctStart + Math.sin(startYear * 0.9) * 0.3 + Math.cos(startYear * 2.5) * 0.1;
    forestPercentStart = Math.max(2.0, Math.min(95.0, forestPercentStart));
    
    const pctEnd = baseForest - decayRate * endDiff;
    const finalPctEnd = endYear >= eventYear ? pctEnd - eventMagnitude : pctEnd;
    forestPercentEnd = finalPctEnd + Math.sin(endYear * 0.9) * 0.3 + Math.cos(endYear * 2.5) * 0.1;
    forestPercentEnd = Math.max(2.0, Math.min(95.0, forestPercentEnd));
  } else {
    const calcLat = lat !== undefined && lat !== null ? Number(lat) : 12.9716;
    const calcLon = lon !== undefined && lon !== null ? Number(lon) : 77.5946;
    
    // Deterministic seed matching sin_hash
    const val = Math.sin(calcLat * 12.9898 + calcLon * 78.233) * 43758.5453;
    const seed = Math.abs(val - Math.floor(val));
    const equatorProximity = Math.max(0.0, 1.0 - (Math.abs(calcLat) / 60.0));
    totalArea = 7.07;

    const isUrban = checkIsUrban(activeRegionName, calcLat, calcLon);
    const isDeclining = true;
    const eventYear = 2005 + Math.floor(seed * 15);
    const eventMagnitude = 1.5 + seed * 2.5;

    let baseForest, decayRate, growthRate;
    if (isUrban) {
      baseForest = 14.0 + seed * 8.0;
      decayRate = 0.12 + seed * 0.08;
      growthRate = 0.06 + seed * 0.08;
    } else {
      baseForest = 30.0 + 35.0 * equatorProximity + (seed - 0.5) * 10.0;
      decayRate = 0.25 + seed * 0.25;
      growthRate = 0.10 + seed * 0.15;
    }

    // Calculate start
    let pctStart = baseForest;
    if (isDeclining) {
      pctStart -= decayRate * startDiff;
      if (startYear >= eventYear) pctStart -= eventMagnitude;
    } else {
      pctStart += growthRate * startDiff;
      if (startYear >= eventYear) pctStart += eventMagnitude;
    }
    const noiseStart = Math.sin(startYear * 1.7 + seed * 5) * 0.45 + Math.cos(startYear * 3.8) * 0.18 + Math.sin(startYear * 0.6) * 0.25;
    pctStart += noiseStart;
    forestPercentStart = Math.max(2.0, Math.min(95.0, pctStart));

    // Calculate end
    let pctEnd = baseForest;
    if (isDeclining) {
      pctEnd -= decayRate * endDiff;
      if (endYear >= eventYear) pctEnd -= eventMagnitude;
    } else {
      pctEnd += growthRate * endDiff;
      if (endYear >= eventYear) pctEnd += eventMagnitude;
    }
    const noiseEnd = Math.sin(endYear * 1.7 + seed * 5) * 0.45 + Math.cos(endYear * 3.8) * 0.18 + Math.sin(endYear * 0.6) * 0.25;
    pctEnd += noiseEnd;
    forestPercentEnd = Math.max(2.0, Math.min(95.0, pctEnd));
  }

  const startCover = (forestPercentStart / 100.0) * totalArea;
  const endCover = (forestPercentEnd / 100.0) * totalArea;

  return { startCover, endCover, totalArea, startPercent: forestPercentStart, endPercent: forestPercentEnd };
};

const getNDVIForYear = (y, baseNDVI, startCover, currentCover, totalArea) => {
  const forestPercent = (currentCover / totalArea) * 100.0;
  let ndvi = 0.15 + 0.72 * (forestPercent / 100.0);
  ndvi = Math.max(0.15, Math.min(0.9, ndvi));
  return Number(ndvi.toFixed(2));
};

const formatCover = (cover, totalArea) => {
  if (totalArea > 100) {
    return Math.round(cover);
  }
  return Math.round(cover * 100) / 100;
};

const ChartModule = () => {
  const isDemo = false;
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract route state or fallback to localStorage — NO demo fallback
  const getInitialState = () => {
    if (location.state && location.state.analysisData) {
      return {
        analysisData: location.state.analysisData,
        activeRegionName: location.state.activeRegionName || 'Selected Region',
        yearStart: location.state.yearStart || 1995,
        yearEnd: location.state.yearEnd || 2026,
        selectedPin: location.state.selectedPin,
        hasData: true
      };
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('deforestation_search_details');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hasData || parsed.analysisData) {
          return {
            analysisData: parsed.analysisData || null,
            activeRegionName: parsed.activeRegionName || 'Selected Region',
            yearStart: parsed.yearStart || 1995,
            yearEnd: parsed.yearEnd || 2026,
            selectedPin: parsed.selectedPin || null,
            hasData: true
          };
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e);
      }
    }
    
    // No data available — user hasn't entered details in Dashboard yet
    return { hasData: false };
  };

  const initialState = getInitialState();

  // If no data, render empty prompt state
  if (!initialState.hasData) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 40px', maxWidth: '560px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Analysis Data Available</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '420px' }}>
            Charts will be generated once you enter a target location in the <strong>Dashboard</strong>, perform an analysis on the <strong>Map</strong>, and click <strong>"View Charts"</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Go to Dashboard
            </button>
            <button onClick={() => navigate('/visualization')} className="btn" style={{ padding: '10px 24px', fontSize: '0.88rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', cursor: 'pointer' }}>
              Open Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { analysisData, activeRegionName, yearStart, yearEnd, selectedPin } = initialState;

  const latVal = selectedPin?.lat ?? analysisData?.lat ?? -3.4653;
  const lonVal = selectedPin?.lng ?? analysisData?.lon ?? -62.2159;

  // Retrieve calculated spatiotemporal bounds
  const { startCover, endCover, totalArea, startPercent, endPercent } = getSpatiotemporalForestCover(latVal, lonVal, yearStart, yearEnd, activeRegionName);

  // Generate temporal historical trend line
  const trendData = [];
  for (let y = yearStart; y <= yearEnd; y++) {
    const { startPercent: percent, startCover: cover } = getSpatiotemporalForestCover(latVal, lonVal, y, y, activeRegionName);
    const ndvi = getNDVIForYear(y, null, startCover, cover, totalArea);
    trendData.push({
      year: y,
      cover: parseFloat(percent.toFixed(1)),
      ndvi: ndvi
    });
  }

  // Format Recharts data
  const forestPercent = analysisData?.forest_percent ?? 100;
  const deforestPercent = analysisData?.deforestation_percent ?? 0;
  const pieData = [
    { name: 'Healthy Forest', value: forestPercent },
    { name: 'Deforested / Degraded', value: deforestPercent },
  ];
  const PIE_COLORS = ['#10b981', '#ef4444'];

  const isLocal = totalArea < 100;
  const displayNetLoss = isLocal ? (startCover - endCover).toFixed(2) : Math.round(startCover - endCover).toLocaleString();
  const displayStartCover = isLocal ? startCover.toFixed(2) : Math.round(startCover).toLocaleString();
  const displayEndCover = isLocal ? endCover.toFixed(2) : Math.round(endCover).toLocaleString();

  const barData = [
    { name: `Cover ${yearStart}`, value: parseFloat(startPercent.toFixed(1)) },
    { name: `Cover ${yearEnd}`, value: parseFloat(endPercent.toFixed(1)) },
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%', width: '100%', overflowY: 'auto' }}>
      
      {/* Top Header Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.08em' }}>
              Charts
            </span>
            {isDemo && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: 600 }}>
                <Sparkles size={10} /> Active Demo
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginTop: '6px', lineHeight: 1.2 }}>{activeRegionName}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--accent-primary)" />
              {latVal.toFixed(4)}° N, {lonVal.toFixed(4)}° E
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="var(--accent-primary)" />
              Analysis Period: {yearStart} – {yearEnd}
            </span>
          </div>
        </div>
      </div>

      {isDemo && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.82rem', color: '#93c5fd', lineHeight: 1.5 }}>
          💡 <strong>Notice:</strong> Currently displaying the <strong>Amazon Basin</strong> spatiotemporal simulation. You can click <strong>Interactive Map</strong> above, click or search any custom location on Earth, and return here to render its telemetry instantly!
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Forest Cover Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TreePine size={14} color="#10b981" /> Remaining Forest
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>
            {forestPercent.toFixed(1)}%
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Current Healthy Forest Cover Area
          </span>
        </div>

        {/* Deforestation Rate Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--danger)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={14} /> Forest Loss Rate
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger)' }}>
            {deforestPercent.toFixed(2)}%
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Forest reduction over the period
          </span>
        </div>

        {/* Total Net Loss Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--accent-secondary)" /> Net Forest Loss
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {displayNetLoss} <span style={{ fontSize: '1rem', fontWeight: 500 }}>km²</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Start: {displayStartCover} km² | End: {displayEndCover} km²
          </span>
        </div>

        {/* Vegetation Density (NDVI) Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#84cc16" /> Vegetation Index (NDVI)
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#84cc16' }}>
            {analysisData?.ndvi ?? 0.65}
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {(analysisData?.ndvi ?? 0.65) > 0.6 ? 'Dense forest cover' : 'Sparse / degraded forest'}
          </span>
        </div>

      </div>

      {/* Threat Alert Panel */}
      {analysisData?.alert && (
        <div className="glass-panel" style={{
          padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center',
          background: analysisData.alert.severity === 'CRITICAL' || analysisData.alert.severity === 'HIGH' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.05)',
          borderLeft: `4px solid ${analysisData.alert.severity === 'CRITICAL' || analysisData.alert.severity === 'HIGH' ? 'var(--danger)' : 'var(--warning)'}`
        }}>
          <ShieldAlert size={28} color={analysisData.alert.severity === 'CRITICAL' || analysisData.alert.severity === 'HIGH' ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: '240px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: analysisData.alert.severity === 'CRITICAL' || analysisData.alert.severity === 'HIGH' ? 'var(--danger)' : 'var(--warning)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Telemetry Warning: {analysisData.alert.status}
            </span>
            <p style={{ fontSize: '0.82rem', margin: '4px 0 0 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {analysisData.alert.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Charts Area */}
      <div className="charts-grid">
        
        {/* Spatiotemporal Forest Decline (Area Chart) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Spatiotemporal Forest Decline (Temporal Trend)</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Annual progression of forest cover in square kilometers</p>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 15, right: 15, left: 55, bottom: 35 }}>
                <defs>
                  <linearGradient id="colorCover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="year" 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={['auto', 'auto']} 
                  tickFormatter={(v) => `${v.toFixed(1)}%`}
                  label={{ value: 'Forest Cover (%)', angle: -90, position: 'insideLeft', offset: -35, fill: 'var(--text-muted)', fontSize: 11, style: { textAnchor: 'middle' } }}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Forest Cover']}
                />
                <Area type="monotone" dataKey="cover" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCover)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forest Distribution (Pie Chart) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Forest Distribution (%)</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Ratio of healthy remaining forest to degraded forest zones</p>
          </div>
          <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={80}
                  outerRadius={105} 
                  paddingAngle={3}
                  label={false}
                  style={{ outline: 'none' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="var(--bg-secondary)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Ratio']}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const percentage = entry.payload.value;
                    return `${value}: ${percentage.toFixed(1)}%`;
                  }}
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Forest Comparison (Bar Chart) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Decadal Cover Comparison</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Net spatiotemporal loss comparing starting year against final year</p>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 15, left: 55, bottom: 35 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  label={{ value: 'Comparison Period', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[0, 100]} 
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Forest Cover (%)', angle: -90, position: 'insideLeft', offset: -35, fill: 'var(--text-muted)', fontSize: 11, style: { textAnchor: 'middle' } }}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Forest Cover']}
                />
                <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} name="Forest Area">
                  <Cell fill="var(--accent-primary)" />
                  <Cell fill="var(--danger)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NDVI Vegetation Density Trend (Area Chart) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>NDVI Vegetation Density Trend</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Annual progression of Normalized Difference Vegetation Index</p>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 15, right: 15, left: 55, bottom: 35 }}>
                <defs>
                  <linearGradient id="colorNDVI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="year" 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={['auto', 'auto']} 
                  tickFormatter={(v) => v.toFixed(2)} 
                  label={{ value: 'NDVI Index', angle: -90, position: 'insideLeft', offset: -35, fill: 'var(--text-muted)', fontSize: 11, style: { textAnchor: 'middle' } }}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  formatter={(v) => [Number(v).toFixed(2), 'NDVI']}
                />
                <Area type="monotone" dataKey="ndvi" stroke="#84cc16" strokeWidth={2} fillOpacity={1} fill="url(#colorNDVI)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ChartModule;
