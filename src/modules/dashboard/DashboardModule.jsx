import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Database, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { regions } from '../../data/mockData';

const DashboardModule = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.removeItem('deforestation_search_details');
  }, []);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    
    const triggerAlert = (msg) => {
      setIsAnalyzing(false);
      alert(msg);
    };

    if (!location && startYear === '' && endYear === '') {
      triggerAlert("Please fill out all the fields.");
      return;
    }
    if (!location || location.trim().length < 4) {
      triggerAlert("Please enter a proper location.");
      return;
    }
    if (startYear === '' || endYear === '') {
      triggerAlert("Please enter both start and end years");
      return;
    }

    const startStr = startYear.toString().trim();
    const endStr = endYear.toString().trim();

    // Check if year length is not exactly 4 digits (e.g. 1, 2, 3, 5 or more digits)
    if (startStr.length !== 4 || endStr.length !== 4) {
      triggerAlert("Please enter a valid year.");
      return;
    }

    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0) {
      triggerAlert("Please enter a valid year.");
      return;
    }

    // If start year exceeds present year 2026
    if (start > 2026) {
      triggerAlert("Please enter a valid year.");
      return;
    }

    // If end year exceeds the present year 2026
    if (end > 2026) {
      triggerAlert("Analysis year should not exceed the present year.");
      return;
    }

    // If start year is after end year
    if (start > end) {
      triggerAlert("Start year cannot be after end year.");
      return;
    }

    const query = location.trim();
    const lowerQuery = query.toLowerCase();
    
    // Check local presets
    const localKeywords = ['amazon', 'brazil', 'congo', 'africa', 'borneo', 'indonesia', 'asia', 'india', 'bengaluru', 'bangalore', 'mysuru', 'mysore'];
    const isLocalMatch = localKeywords.some(k => lowerQuery.includes(k));
    
    if (!isLocalMatch) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!data || data.length === 0) {
          triggerAlert("Please enter a proper location.");
          return;
        }
      } catch (err) {
        // Fallback if API/Internet is offline: check if it contains at least one vowel
        if (!/[aeiouy]/i.test(query)) {
          triggerAlert("Please enter a proper location.");
          return;
        }
      }
    }

    localStorage.setItem('deforestation_search_details', JSON.stringify({
      activeRegionName: query,
      yearStart: start,
      yearEnd: end,
      hasData: true
    }));

    setIsAnalyzing(false);
    navigate('/visualization', { state: { location: query, startYear, endYear } });
  };

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1>Satellite Based Spatio-Temporal Analysis for Deforestation Detection</h1>
        <p>Integrated satellite telemetry portal mapped to backend services for deforestation analysis, forest cover predictions, and real-time ecological alerts.</p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--accent-primary)" />
          New Analysis Request
        </h3>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleStartAnalysis(); }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}
        >
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Location</label>
            <input 
              type="text" 
              placeholder="enter location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} 
            />
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Start Year</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={startYear}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 4 && /^\d*$/.test(val)) {
                  setStartYear(val);
                }
              }}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} 
            />
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>End Year</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={endYear}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 4 && /^\d*$/.test(val)) {
                  setEndYear(val);
                }
              }}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} 
            />
          </div>
          <button 
            type="submit"
            style={{ 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: isAnalyzing ? '2px solid #fff' : 'none', 
              background: isAnalyzing ? '#059669' : 'var(--accent-primary)', 
              boxShadow: isAnalyzing ? '0 0 15px rgba(16, 185, 129, 0.6)' : 'none',
              transform: isAnalyzing ? 'scale(0.96)' : 'none',
              color: '#fff', 
              fontWeight: '600', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              height: '42px', 
              transition: 'all 0.2s ease-in-out' 
            }} 
            onMouseOver={(e) => { if (!isAnalyzing) e.currentTarget.style.background = '#059669'; }} 
            onMouseOut={(e) => { if (!isAnalyzing) e.currentTarget.style.background = 'var(--accent-primary)'; }}
          >
            <TrendingUp size={18} />
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </button>
        </form>
      </div>


    </div>
  );
};

export default DashboardModule;
