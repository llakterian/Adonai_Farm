import React, { useState } from 'react';
import axios from 'axios';

export default function Account() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!currentPassword) {
      setMessage('Current password is required');
      setMessageType('error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (!newUsername && !newPassword) {
      setMessage('Please provide either a new username or new password');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      
      await axios.put(api + '/auth/update', {
        currentPassword,
        newUsername: newUsername || undefined,
        newPassword: newPassword || undefined
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });

      setMessage('Account updated successfully! Please sign in again with your new credentials.');
      setMessageType('success');
      
      // Clear form
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        localStorage.removeItem('adonai_token');
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Update failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adonai_token');
    window.location.href = '/login';
  };

  return (
    <div>
      <h1 className="page-title">👤 Account Settings</h1>

      {/* Account Overview */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          🌾 Farm Account Overview
        </h2>
        <div style={{ 
          background: 'var(--soft-white)', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--primary-green)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginRight: '1rem'
            }}>
              👨‍🌾
            </div>
            <div>
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '0.25rem' }}>
                Farm Administrator
              </h3>
              <p style={{ color: 'var(--text-light)', margin: 0 }}>
                Managing Adonai Farm operations
              </p>
            </div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>🔐</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Secure Access</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>📊</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Full Permissions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>🌾</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Farm Management</div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Account Form */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          ✏️ Update Account Information
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>🔒 Current Password *</label>
            <input 
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={loading}
            />
            <small style={{ color: 'var(--text-light)' }}>
              Required to verify your identity
            </small>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>👤 New Username</label>
              <input 
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="Enter new username (optional)"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>🔑 New Password</label>
              <input 
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                disabled={loading}
              />
            </div>
          </div>

          {newPassword && (
            <div className="form-group">
              <label>🔑 Confirm New Password</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                disabled={loading}
              />
            </div>
          )}

          {message && (
            <div className={`message ${messageType === 'error' ? 'message-error' : 'message-success'}`}>
              {messageType === 'error' ? '❌' : '✅'} {message}
            </div>
          )}

          <div className="btn-group">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>⏳ Updating...</>
              ) : (
                <>💾 Update Account</>
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => {
                setCurrentPassword('');
                setNewUsername('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage(null);
              }}
              disabled={loading}
            >
              🔄 Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Security Information */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          🛡️ Security Information
        </h2>
        <div style={{ 
          background: 'var(--soft-white)', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
            Password Security Tips
          </h4>
          <ul style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
            <li>Use a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and special characters</li>
            <li>Don't reuse passwords from other accounts</li>
            <li>Change your password regularly</li>
          </ul>
        </div>
        
        <div className="btn-group">
          <button 
            className="btn btn-danger"
            onClick={handleLogout}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
