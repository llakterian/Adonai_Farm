import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adonai123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await axios.post(api + '/auth/login', { username, password });
      localStorage.setItem('adonai_token', res.data.token);
      window.location.href = '/';
    } catch (e) {
      setError(e?.response?.data?.error || 'Login failed. Please check your credentials.');
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
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-light)',
            margin: 0
          }}>
            <strong>Username:</strong> admin<br />
            <strong>Password:</strong> adonai123
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          color: 'var(--text-light)',
          fontSize: '0.85rem'
        }}>
          <p>🌱 Sustainable farming through technology</p>
        </div>
      </div>
    </div>
  );
}
