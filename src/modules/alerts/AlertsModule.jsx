import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Flame, ShieldAlert, CheckCircle, RefreshCw, Loader } from 'lucide-react';

const AlertsModule = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem('deforestation_search_details');
  const hasData = saved ? (JSON.parse(saved).hasData || !!JSON.parse(saved).analysisData) : false;

  if (!hasData) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 40px', maxWidth: '560px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alerts Panel Offline</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '420px' }}>
            The alert thresholds and notification feed will be generated once you enter a target location and start analysis on the <strong>Dashboard</strong>.
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

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to parse the payload string inside historical logs into a clean object
  const parsePayload = (payloadStr) => {
    if (!payloadStr) return { location: 'Unknown', forest: 0, deforestation: 0, ndvi: 0 };
    try {
      const locMatch = payloadStr.match(/location:\s*"([^"]+)"/) || payloadStr.match(/location:\s*'([^']+)'/) || payloadStr.match(/"location":\s*"([^"]+)"/);
      const forestMatch = payloadStr.match(/forest:\s*([\d.]+)/) || payloadStr.match(/"forest":\s*([\d.]+)/);
      const defMatch = payloadStr.match(/deforestation:\s*([\d.]+)/) || payloadStr.match(/"deforestation":\s*([\d.]+)/);
      const ndviMatch = payloadStr.match(/ndvi:\s*([\d.]+)/) || payloadStr.match(/"ndvi":\s*([\d.]+)/);
      
      return {
        location: locMatch ? locMatch[1] : 'Unknown Region',
        forest: forestMatch ? parseFloat(forestMatch[1]) : 0.0,
        deforestation: defMatch ? parseFloat(defMatch[1]) : 0.0,
        ndvi: ndviMatch ? parseFloat(ndviMatch[1]) : 0.0
      };
    } catch (e) {
      return { location: 'Unknown Region', forest: 0, deforestation: 0, ndvi: 0 };
    }
  };

  const getAlertDetails = (deforestation, forest) => {
    // If remaining forest is very high (>= 80.0%), it is a dense forest area with stable biosphere
    if (forest >= 80.0) {
      return {
        status: 'Normal',
        desc: `NOMINAL: Forest cover is healthy at ${forest.toFixed(1)}%. No immediate action is required — regular monitoring is recommended.`
      };
    }
    
    // Otherwise, classify based on remaining forest / absolute deforestation
    if (deforestation >= 50.0) {
      return {
        status: 'Critical',
        desc: `CRITICAL ECOLOGICAL ALERT: High deforestation cover of ${deforestation.toFixed(2)}% detected (Remaining Forest: ${forest.toFixed(1)}%). Urgent tree conservation is highly recommended.`
      };
    } else if (deforestation >= 20.0) {
      return {
        status: 'Warning',
        desc: `WARNING: Moderate tree loss of ${deforestation.toFixed(2)}% detected (Remaining Forest: ${forest.toFixed(1)}%). Immediate steps to protect and restore the remaining forest cover are advised.`
      };
    } else {
      return {
        status: 'Normal',
        desc: `NOMINAL: Tree loss is minimal at ${deforestation.toFixed(2)}% (Remaining Forest: ${forest.toFixed(1)}%). The forest is stable — continue routine observation.`
      };
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('deforestation_search_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeRegionName && parsed.analysisData) {
          const forestRate = parsed.analysisData.forest_percent ?? 0;
          const defRate = parsed.analysisData.deforestation_percent ?? 0;
          
          const alertInfo = getAlertDetails(defRate, forestRate);

          setAlerts([{
            id: Date.now(),
            region: parsed.activeRegionName,
            rate: `${defRate.toFixed(2)}%`,
            status: alertInfo.status,
            desc: alertInfo.desc,
            time: 'Active Session'
          }]);
          return;
        }
      }
      setAlerts([]);
    } catch (e) {
      console.error("Failed to load active region from localStorage", e);
      setAlerts([]);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/logs');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const formattedAlerts = data.map((log) => {
          const parsed = parsePayload(log.payload);
          
          // Re-evaluate alert details strictly against report deforestation/forest values
          const alertInfo = getAlertDetails(parsed.deforestation, parsed.forest);

          return {
            id: log.id,
            region: parsed.location,
            rate: `${parsed.deforestation.toFixed(2)}%`,
            status: alertInfo.status,
            desc: alertInfo.desc,
            time: log.timestamp || log.time || 'Some time ago'
          };
        });
        setAlerts(formattedAlerts);
      } else {
        loadFromLocalStorage();
      }
    } catch (err) {
      console.warn("Flask backend offline or error, loading from localStorage fallback.", err);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="alerts-page">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Real-Time Alerts</h1>
          <p>Live satellite telemetry alerts and environmental status logs.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ marginRight: '6px' }} /> Refresh Alerts
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
        <div className="glass-card flex-col" style={{ gap: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Alert Threshold Criteria</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Flame size={20} color="var(--danger)" />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>CRITICAL Threshold (&ge; 50.0% Deforestation)</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Triggers high-priority push events and database commits.</p>
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ShieldAlert size={20} color="var(--warning)" />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>WARNING Threshold (20.0% - 50.0% Deforestation)</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Logs non-destructive forest loss for seasonal observation.</p>
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} color="var(--success)" />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>NORMAL Threshold (&lt; 20.0% Deforestation or &ge; 80% Forest)</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>Baseline environmental telemetry logging; no action required.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card flex-col" style={{ gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Active Notification Feed</h3>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', gap: '10px', color: 'var(--text-secondary)' }}>
              <Loader className="animate-spin" size={24} />
              <span>Fetching query telemetry alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
              <Bell size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 500, marginBottom: '4px' }}>No Active Alerts</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Perform a query search on the Map or Dashboard to log and monitor region alerts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map((al) => (
                <div 
                  key={al.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '16px', 
                    borderLeft: al.status === 'Critical' ? '4px solid var(--danger)' : al.status === 'Warning' ? '4px solid var(--warning)' : '4px solid var(--success)',
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          color: '#fff' 
                        }}
                      >
                        {al.region}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {al.time}</span>
                    </div>
                    <div 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 600, 
                        color: al.status === 'Critical' ? 'var(--danger)' : al.status === 'Warning' ? 'var(--warning)' : 'var(--success)',
                        background: al.status === 'Critical' ? 'rgba(239,68,68,0.08)' : al.status === 'Warning' ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      Rate: {al.rate} ({al.status})
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{al.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsModule;

