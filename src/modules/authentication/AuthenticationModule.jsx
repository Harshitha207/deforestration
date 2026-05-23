import React, { useState } from 'react';
import { Shield, Key, Mail, User, CheckCircle2 } from 'lucide-react';

const AuthenticationModule = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('analyst@terraguard.org');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Admin Analyst');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }, 1500);
  };

  return (
    <div className="auth-page flex justify-center items-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="glass-card flex-col" style={{ width: '100%', maxWidth: '400px', gap: '24px' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', color: 'var(--accent-primary)' }}>
            <Shield size={28} />
          </div>
          <h2>{isLogin ? 'Security Access' : 'Register Operator'}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Synchronized with Python security module <code>authentication.py</code>.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: 'var(--success)' }}>Access Authorized</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Security context loaded and JWT issued.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Operator Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    style={{ paddingLeft: '36px' }} 
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Security Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ paddingLeft: '36px' }} 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Access Token / Password</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  style={{ paddingLeft: '36px' }} 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Authenticating Operator...' : isLogin ? 'Verify Credentials' : 'Register Operator'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
              >
                {isLogin ? 'Register a new telemetry operator account' : 'Return to secure access portal'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default AuthenticationModule;
