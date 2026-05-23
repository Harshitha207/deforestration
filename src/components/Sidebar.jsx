import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Database, 
  Globe, 
  TrendingUp, 
  Map, 
  Bell, 
  FileText, 
  Terminal,
  BarChart3,
  History,
  Info
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/visualization', label: 'Map Visualization', icon: Shield },
    { path: '/charts', label: 'Charts', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/alerts', label: 'Real-time Alerts', icon: Bell },
    { path: '/prediction', label: 'Future Deforestation Predictor', icon: TrendingUp },
    { path: '/satellite-fetch', label: 'Sat Fetcher', icon: Globe },
    { path: '/search-history', label: 'Searched Regions History', icon: History },
    { path: '/about', label: 'About', icon: Info }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
          <Map className="text-accent-primary" size={32} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', lineHeight: '1.2' }}>
            Satellite Based Spatio-Temporal Analysis for Deforestation Detection
          </span>
        </div>
      </div>
      
      <nav className="sidebar-nav flex-col gap-2" style={{ flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={18} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                {item.file && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.file}</span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>
      

    </aside>
  );
};

export default Sidebar;
