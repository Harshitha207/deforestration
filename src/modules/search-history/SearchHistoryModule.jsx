import React, { useState, useEffect } from 'react';
import { History, MapPin, TreePine, AlertTriangle, Clock, Trash2 } from 'lucide-react';

const SearchHistoryModule = () => {
  const defaultLogs = [
    { id: 1, type: 'insert', query: 'save_analysis', payload: '{location: "Bugle Rock Road", forest: 89.6, deforestation: 10.36, ndvi: 0.58}', status: 'Success', time: '10 mins ago', timestamp: '2026-05-21 17:53:35' },
    { id: 2, type: 'insert', query: 'save_analysis', payload: '{location: "Chandana Layout", forest: 90.6, deforestation: 9.35, ndvi: 0.59}', status: 'Success', time: '22 mins ago', timestamp: '2026-05-21 17:53:27' },
    { id: 3, type: 'insert', query: 'save_analysis', payload: '{location: "Herohalli", forest: 89.4, deforestation: 10.65, ndvi: 0.57}', status: 'Success', time: '1 hour ago', timestamp: '2026-05-21 17:53:05' },
    { id: 4, type: 'insert', query: 'save_analysis', payload: '{location: "Yandahalli", forest: 89.3, deforestation: 10.66, ndvi: 0.58}', status: 'Success', time: '5 hours ago', timestamp: '2026-05-21 17:50:12' }
  ];

  const [logs, setLogs] = useState(defaultLogs);
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

  const fetchDbLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn("Flask backend offline, falling back to static database logs.", err);
      setLogs(defaultLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbLogs();
  }, []);

  const clearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear the search history?")) return;
    try {
      const response = await fetch('/api/logs/clear', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.status === 'Success') {
        setLogs([]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn("Failed to clear backend database logs, clearing client state.", err);
      setLogs([]);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) return;
    try {
      const response = await fetch(`/api/logs/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.status === 'Success') {
        setLogs(logs.filter(log => log.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.warn("Failed to delete log from backend, removing locally.", err);
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  return (
    <div className="search-history-page" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Searched Regions History</h1>
          <p>A complete log of all regions you have analyzed.</p>
        </div>
        <button 
          onClick={clearLogs}
          className="btn btn-outline"
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.85rem' }}
        >
          Clear History
        </button>
      </div>

      <div className="glass-card flex-col" style={{ gap: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="var(--accent-secondary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Searched Regions Log</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {logs.length} regions stored
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading search history...
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px', fontWeight: 500 }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Timestamp</div></th>
                  <th style={{ padding: '12px', fontWeight: 500 }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> Region Name</div></th>
                  <th style={{ padding: '12px', fontWeight: 500 }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TreePine size={14}/> Forest Cover</div></th>
                  <th style={{ padding: '12px', fontWeight: 500 }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14}/> Deforestation</div></th>
                  <th style={{ padding: '12px', fontWeight: 500, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const parsed = parsePayload(log.payload);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '14px 12px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {log.timestamp || log.time}
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {parsed.location}
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                          {parsed.forest.toFixed(1)}%
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--danger)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                          {parsed.deforestation.toFixed(2)}%
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => deleteLog(log.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                          title="Delete this entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                      <History size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                      No regions have been searched yet.<br/>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Go to the Dashboard and start an analysis to see history here.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryModule;
