import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../auth.js';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adonai123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login with username:', username);

      // Use client-side authentication since Netlify functions aren't working
      const result = authenticateUser(username, password);

      if (result.success) {
        console.log('Login successful:', result);
        // Use React Router navigation instead of window.location.href
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (e) {
      console.error('Login error:', e);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.9) 0%, rgba(74, 124, 89, 0.9) 100%), url("/images/hero-farm.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Logo and Welcome */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem',
            color: 'var(--primary-green)'
          }}>
            🌾
          </div>
          <h1 style={{
            color: 'var(--primary-green)',
            marginBottom: '0.5rem',
            fontSize: '2rem'
          }}>
            Adonai Farm
          </h1>
          <p style={{
            color: 'var(--text-light)',
            fontSize: '1rem'
          }}>
            Welcome back to your farm management system
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="message message-error">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '1rem',
              fontSize: '1.1rem',
              padding: '1rem'
            }}
          >
            {loading ? (
              <>
                <span style={{ marginRight: '0.5rem' }}>⏳</span>
                Signing in...
              </>
            ) : (
              <>
                <span style={{ marginRight: '0.5rem' }}>🚪</span>
                Sign In to Farm
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--cream)',
          borderRadius: '8px',
          border: '1px solid var(--accent-gold)'
        }}>
          <h4 style={{
            color: 'var(--primary-green)',
            marginBottom: '0.5rem',
            fontSize: '0.9rem'
          }}>
            🔑 Demo Credentials
          </h4>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-light)',
            margin: 0
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Admin:</strong> admin / adonai123
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Supervisor:</strong> supervisor / super123
            </div>
            <div>
              <strong>Worker:</strong> worker / work123
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'var(--text-light)',
          fontSize: '0.85rem'
        }}>
          <p>🌱 Sustainable farming through technology</p>
          <p style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            opacity: 0.8
          }}>
            Built by <a
              href="mailto:triolinkl@gmail.com"
              style={{
                color: 'var(--accent-gold)',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              TrioLink Ltd.
            </a> - Want a website like this? Contact us!
          </p>
        </div>
      </div>
    </div>
  );
}
