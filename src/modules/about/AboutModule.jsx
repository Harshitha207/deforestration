import React from 'react';
import { Info, Map, ShieldCheck, Activity, Globe } from 'lucide-react';

const AboutModule = () => {
  return (
    <div className="about-page" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(16,185,129,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Globe size={40} color="var(--accent-primary)" />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
          Satellite Based Spatio-Temporal Analysis for Deforestation Detection
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          A comprehensive intelligence platform designed to monitor, analyze, and predict the health of global ecosystems using advanced satellite telemetry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Map size={24} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Project Vision</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Our planet's forests are critical for maintaining ecological balance, supporting wildlife, and combating climate change. This project was created to provide a clear, real-time window into the changing landscapes of our world. By utilizing geospatial data, we aim to empower environmentalists, researchers, and local communities to identify regions at risk and take immediate action.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} color="var(--danger)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Core Objectives</h3>
          </div>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><strong>Continuous Monitoring:</strong> Track the historical and current state of global forest coverage over decades.</li>
            <li><strong>Predictive Analytics:</strong> Forecast potential future deforestation risks to enable preventive conservation.</li>
            <li><strong>Rapid Response:</strong> Generate immediate alerts when critical thresholds of tree loss are detected.</li>
            <li><strong>Data Accessibility:</strong> Translate complex satellite telemetry into easy-to-understand visual maps and charts.</li>
          </ul>
        </div>

        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={24} color="#3b82f6" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>The Importance of Conservation</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Deforestation threatens biodiversity and accelerates environmental degradation. This system acts as a digital guardian, highlighting the precise locations where intervention is most needed. By making spatio-temporal data highly visible and actionable, we hope to foster a greater understanding of our environmental impact and promote sustainable practices that will protect the Earth's vital biosphere regions for generations to come.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutModule;
