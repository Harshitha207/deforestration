import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-header" style={{ justifyContent: 'flex-end', position: 'relative' }}>
      
      <div className="flex items-center gap-4">
        
        <div 
          ref={menuRef}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div 
            className="user-profile-mini" 
            onClick={() => setIsOpen(!isOpen)}
            style={{ 
              background: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderRadius: '8px',
              padding: '4px 8px',
              transition: 'background 0.2s'
            }}
          >
            <div className="avatar">A</div>
            <div className="flex-col" style={{ gap: '2px', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin User</span>
            </div>
          </div>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: '0',
              background: '#0f172a',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '16px',
              minWidth: '200px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(16,185,129,0.3)'
              }}>
                A
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin User</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
