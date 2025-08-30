import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  createSystemBackup,
  exportBackupFile,
  importBackupFile,
  restoreSystemData,
  validateBackupData,
  getStorageUsage,
  cleanupStorageData
} from '../utils/dataBackup.js';
import {
  performSystemHealthCheck,
  startPerformanceMonitoring,
  stopPerformanceMonitoring,
  getCurrentHealthData,
  getPerformanceLog,
  getSystemDiagnostics
} from '../utils/systemHealth.js';
import { canAccess } from '../auth.js';

export default function Account() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  // Backup and restore state
  const [backupMessage, setBackupMessage] = useState(null);
  const [backupMessageType, setBackupMessageType] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [storageUsage, setStorageUsage] = useState(null);
  const [importedBackup, setImportedBackup] = useState(null);
  const fileInputRef = useRef(null);

  // System health monitoring state
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [performanceLog, setPerformanceLog] = useState([]);
  const [systemDiagnostics, setSystemDiagnostics] = useState(null);

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
      const api = import.meta.env.VITE_API_URL || window.location.origin;
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
        navigate('/login', { replace: true });
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
    navigate('/login', { replace: true });
  };

  // Backup and restore functions
  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupMessage(null);

    try {
      const result = createSystemBackup();
      if (result.success) {
        const exportResult = exportBackupFile(result.backup);
        if (exportResult.success) {
          setBackupMessage(`Backup created and downloaded: ${exportResult.filename}`);
          setBackupMessageType('success');
        } else {
          setBackupMessage(exportResult.message);
          setBackupMessageType('error');
        }
      } else {
        setBackupMessage(result.message);
        setBackupMessageType('error');
      }
    } catch (error) {
      setBackupMessage('Failed to create backup: ' + error.message);
      setBackupMessageType('error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setBackupLoading(true);
    setBackupMessage(null);

    try {
      const result = await importBackupFile(file);
      if (result.success) {
        setImportedBackup(result.backup);
        setBackupMessage(`Backup file imported: ${result.filename}`);
        setBackupMessageType('success');
      } else {
        setBackupMessage(result.message);
        setBackupMessageType('error');
      }
    } catch (error) {
      setBackupMessage('Failed to import backup: ' + error.message);
      setBackupMessageType('error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!importedBackup) {
      setBackupMessage('Please import a backup file first');
      setBackupMessageType('error');
      return;
    }

    if (!confirm('This will overwrite all current data. Are you sure you want to restore from backup?')) {
      return;
    }

    setBackupLoading(true);
    setBackupMessage(null);

    try {
      const validation = validateBackupData(importedBackup);
      if (!validation.success) {
        setBackupMessage('Backup validation failed: ' + validation.errors.join(', '));
        setBackupMessageType('error');
        return;
      }

      const result = restoreSystemData(importedBackup, { overwrite: true });
      if (result.success) {
        setBackupMessage('System restored successfully! Please refresh the page.');
        setBackupMessageType('success');
        setImportedBackup(null);

        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setBackupMessage('Restore failed: ' + result.errors.join(', '));
        setBackupMessageType('error');
      }
    } catch (error) {
      setBackupMessage('Failed to restore backup: ' + error.message);
      setBackupMessageType('error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleGetStorageUsage = () => {
    const usage = getStorageUsage();
    setStorageUsage(usage);
  };

  const handleCleanupStorage = () => {
    if (!confirm('This will clean up orphaned and duplicate data. Continue?')) {
      return;
    }

    const result = cleanupStorageData();
    if (result.success) {
      setBackupMessage('Storage cleanup completed: ' + result.cleaned.join(', '));
      setBackupMessageType('success');
    } else {
      setBackupMessage('Cleanup failed: ' + result.errors.join(', '));
      setBackupMessageType('error');
    }
  };

  // System health monitoring functions
  const handleHealthCheck = async () => {
    setHealthLoading(true);
    setBackupMessage(null);

    try {
      const result = performSystemHealthCheck();
      if (result.success) {
        setHealthData(result.healthCheck);
        setBackupMessage(`Health check completed - Status: ${result.healthCheck.status}`);
        setBackupMessageType(result.healthCheck.status === 'healthy' ? 'success' : 'error');
      } else {
        setBackupMessage('Health check failed: ' + result.error);
        setBackupMessageType('error');
      }
    } catch (error) {
      setBackupMessage('Health check error: ' + error.message);
      setBackupMessageType('error');
    } finally {
      setHealthLoading(false);
    }
  };

  const handleStartMonitoring = () => {
    try {
      startPerformanceMonitoring();
      setMonitoringActive(true);
      setBackupMessage('Performance monitoring started');
      setBackupMessageType('success');
    } catch (error) {
      setBackupMessage('Failed to start monitoring: ' + error.message);
      setBackupMessageType('error');
    }
  };

  const handleStopMonitoring = () => {
    try {
      stopPerformanceMonitoring();
      setMonitoringActive(false);
      setBackupMessage('Performance monitoring stopped');
      setBackupMessageType('success');
    } catch (error) {
      setBackupMessage('Failed to stop monitoring: ' + error.message);
      setBackupMessageType('error');
    }
  };

  const handleGetPerformanceLog = () => {
    try {
      const log = getPerformanceLog(50);
      setPerformanceLog(log);
      setBackupMessage(`Retrieved ${log.length} performance log entries`);
      setBackupMessageType('success');
    } catch (error) {
      setBackupMessage('Failed to get performance log: ' + error.message);
      setBackupMessageType('error');
    }
  };

  const handleGetDiagnostics = () => {
    try {
      const diagnostics = getSystemDiagnostics();
      setSystemDiagnostics(diagnostics);
      setBackupMessage('System diagnostics retrieved');
      setBackupMessageType('success');
    } catch (error) {
      setBackupMessage('Failed to get diagnostics: ' + error.message);
      setBackupMessageType('error');
    }
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

      {/* Data Backup and Restore - Admin Only */}
      {canAccess('users') && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
            💾 Data Backup & Restore
          </h2>

          {backupMessage && (
            <div className={`message ${backupMessageType === 'error' ? 'message-error' : 'message-success'}`}>
              {backupMessageType === 'error' ? '❌' : '✅'} {backupMessage}
            </div>
          )}

          {/* Backup Section */}
          <div style={{
            background: 'var(--soft-white)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              📤 Create System Backup
            </h4>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
              Export all farm data including animals, workers, infrastructure, users, and gallery photos.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleCreateBackup}
              disabled={backupLoading}
            >
              {backupLoading ? (
                <>⏳ Creating Backup...</>
              ) : (
                <>💾 Create & Download Backup</>
              )}
            </button>
          </div>

          {/* Restore Section */}
          <div style={{
            background: 'var(--soft-white)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              📥 Restore from Backup
            </h4>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
              Import and restore system data from a previously created backup file.
            </p>

            <div className="btn-group" style={{ marginBottom: '1rem' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={backupLoading}
              >
                📁 Select Backup File
              </button>

              {importedBackup && (
                <button
                  className="btn btn-primary"
                  onClick={handleRestoreBackup}
                  disabled={backupLoading}
                >
                  {backupLoading ? (
                    <>⏳ Restoring...</>
                  ) : (
                    <>🔄 Restore System</>
                  )}
                </button>
              )}
            </div>

            {importedBackup && (
              <div style={{
                background: 'rgba(45, 80, 22, 0.1)',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid var(--primary-green)'
              }}>
                <h5 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                  Backup Ready for Restore
                </h5>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
                  Created: {new Date(importedBackup.metadata?.created_at).toLocaleString()}<br />
                  Data Types: {importedBackup.metadata?.data_types?.join(', ') || 'Unknown'}<br />
                  Statistics: {JSON.stringify(importedBackup.metadata?.statistics || {})}
                </p>
              </div>
            )}
          </div>

          {/* Storage Management */}
          <div style={{
            background: 'var(--soft-white)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              🗄️ Storage Management
            </h4>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
              Monitor storage usage and clean up orphaned or duplicate data.
            </p>

            <div className="btn-group" style={{ marginBottom: '1rem' }}>
              <button
                className="btn btn-outline"
                onClick={handleGetStorageUsage}
              >
                📊 Check Storage Usage
              </button>
              <button
                className="btn btn-outline"
                onClick={handleCleanupStorage}
              >
                🧹 Cleanup Storage
              </button>
            </div>

            {storageUsage && (
              <div style={{
                background: 'rgba(45, 80, 22, 0.1)',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid var(--primary-green)'
              }}>
                <h5 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                  Storage Usage Report
                </h5>
                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  <p>Total Size: {(storageUsage.totalSize / 1024).toFixed(1)}KB</p>
                  <p>Usage: {storageUsage.usagePercentage.toFixed(1)}% of estimated quota</p>
                  {storageUsage.error && (
                    <p style={{ color: 'var(--danger-red)' }}>Error: {storageUsage.error}</p>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Breakdown:</strong>
                    {Object.entries(storageUsage.breakdown).map(([key, data]) => (
                      <div key={key} style={{ marginLeft: '1rem' }}>
                        {key}: {(data.size / 1024).toFixed(1)}KB ({data.items} items)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            padding: '1rem',
            borderRadius: '6px',
            border: '1px solid var(--accent-gold)'
          }}>
            <h5 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
              ⚠️ Important Notes
            </h5>
            <ul style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
              <li>Backups include all system data and can be large files</li>
              <li>Restoring will overwrite all current data - use with caution</li>
              <li>Regular backups are recommended before major changes</li>
              <li>Storage cleanup removes orphaned and duplicate entries</li>
            </ul>
          </div>
        </div>
      )}

      {/* System Health and Performance Monitoring - Admin Only */}
      {canAccess('users') && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
            🏥 System Health & Performance Monitoring
          </h2>

          {/* Health Check Section */}
          <div style={{
            background: 'var(--soft-white)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              🔍 System Health Check
            </h4>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
              Perform comprehensive system diagnostics including storage, data integrity, and performance checks.
            </p>

            <div className="btn-group" style={{ marginBottom: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleHealthCheck}
                disabled={healthLoading}
              >
                {healthLoading ? (
                  <>⏳ Checking...</>
                ) : (
                  <>🔍 Run Health Check</>
                )}
              </button>
              <button
                className="btn btn-outline"
                onClick={handleGetDiagnostics}
              >
                📋 Get Diagnostics
              </button>
            </div>

            {healthData && (
              <div style={{
                background: healthData.status === 'healthy'
                  ? 'rgba(45, 80, 22, 0.1)'
                  : healthData.status === 'warning'
                    ? 'rgba(255, 193, 7, 0.1)'
                    : 'rgba(220, 53, 69, 0.1)',
                padding: '1rem',
                borderRadius: '6px',
                border: `1px solid ${healthData.status === 'healthy'
                    ? 'var(--primary-green)'
                    : healthData.status === 'warning'
                      ? 'var(--accent-gold)'
                      : 'var(--danger-red)'
                  }`
              }}>
                <h5 style={{
                  color: healthData.status === 'healthy'
                    ? 'var(--primary-green)'
                    : healthData.status === 'warning'
                      ? 'var(--accent-gold)'
                      : 'var(--danger-red)',
                  marginBottom: '0.5rem'
                }}>
                  {healthData.status === 'healthy' ? '✅' : healthData.status === 'warning' ? '⚠️' : '❌'}
                  System Status: {healthData.status.toUpperCase()}
                </h5>
                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  <p><strong>Last Check:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>

                  {healthData.issues.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ color: 'var(--danger-red)' }}>Issues:</strong>
                      <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                        {healthData.issues.map((issue, index) => (
                          <li key={index} style={{ color: 'var(--danger-red)' }}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {healthData.warnings.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ color: 'var(--accent-gold)' }}>Warnings:</strong>
                      <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                        {healthData.warnings.map((warning, index) => (
                          <li key={index} style={{ color: 'var(--accent-gold)' }}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {healthData.storage && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Storage:</strong> {healthData.storage.totalSizeKB}KB used
                      ({healthData.storage.usagePercentage.toFixed(1)}% of quota)
                    </div>
                  )}

                  {healthData.performance && healthData.performance.healthCheckDuration && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Check Duration:</strong> {healthData.performance.healthCheckDuration.toFixed(2)}ms
                    </div>
                  )}

                  {healthData.recommendations && healthData.recommendations.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Recommendations:</strong>
                      <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                        {healthData.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Performance Monitoring Section */}
          <div style={{
            background: 'var(--soft-white)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              📈 Performance Monitoring
            </h4>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
              Monitor system performance in real-time and track performance metrics over time.
            </p>

            <div className="btn-group" style={{ marginBottom: '1rem' }}>
              {!monitoringActive ? (
                <button
                  className="btn btn-primary"
                  onClick={handleStartMonitoring}
                >
                  ▶️ Start Monitoring
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={handleStopMonitoring}
                >
                  ⏹️ Stop Monitoring
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={handleGetPerformanceLog}
              >
                📊 View Performance Log
              </button>
            </div>

            {monitoringActive && (
              <div style={{
                background: 'rgba(45, 80, 22, 0.1)',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--primary-green)',
                marginBottom: '1rem'
              }}>
                <span style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>
                  🟢 Performance monitoring is active
                </span>
              </div>
            )}

            {performanceLog.length > 0 && (
              <div style={{
                background: 'rgba(45, 80, 22, 0.1)',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid var(--primary-green)'
              }}>
                <h5 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                  Performance Log ({performanceLog.length} entries)
                </h5>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  color: 'var(--text-light)',
                  fontSize: '0.8rem'
                }}>
                  {performanceLog.slice(-10).reverse().map((entry, index) => (
                    <div key={index} style={{
                      padding: '0.25rem 0',
                      borderBottom: index < 9 ? '1px solid rgba(45, 80, 22, 0.1)' : 'none'
                    }}>
                      <strong>{new Date(entry.timestamp).toLocaleTimeString()}</strong> -
                      Status: <span style={{
                        color: entry.status === 'healthy' ? 'var(--primary-green)' :
                          entry.status === 'warning' ? 'var(--accent-gold)' : 'var(--danger-red)'
                      }}>
                        {entry.status}
                      </span> -
                      Response: {entry.responseTime.toFixed(2)}ms -
                      Storage: {entry.storageUsage.toFixed(1)}%
                      {entry.issueCount > 0 && ` - Issues: ${entry.issueCount}`}
                      {entry.warningCount > 0 && ` - Warnings: ${entry.warningCount}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Diagnostics Section */}
          {systemDiagnostics && (
            <div style={{
              background: 'var(--soft-white)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
                🔧 System Diagnostics Summary
              </h4>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Overall Status:</strong><br />
                    <span style={{
                      color: systemDiagnostics.overall.status === 'healthy' ? 'var(--primary-green)' :
                        systemDiagnostics.overall.status === 'warning' ? 'var(--accent-gold)' : 'var(--danger-red)'
                    }}>
                      {systemDiagnostics.overall.status.toUpperCase()}
                    </span><br />
                    Monitoring: {systemDiagnostics.overall.monitoringActive ? 'Active' : 'Inactive'}
                  </div>
                  <div>
                    <strong>Storage:</strong><br />
                    Size: {systemDiagnostics.storage.totalSizeMB}MB<br />
                    Usage: {systemDiagnostics.storage.usagePercentage.toFixed(1)}%
                  </div>
                  <div>
                    <strong>Performance:</strong><br />
                    Memory: {systemDiagnostics.performance.estimatedMemoryMB}MB<br />
                    Avg Response: {systemDiagnostics.performance.averageResponseTime.toFixed(2)}ms
                  </div>
                  <div>
                    <strong>Browser:</strong><br />
                    Platform: {systemDiagnostics.browser.platform}<br />
                    Online: {systemDiagnostics.browser.online ? 'Yes' : 'No'}
                  </div>
                </div>

                {systemDiagnostics.storage.itemCounts && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Data Counts:</strong>
                    <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                      {Object.entries(systemDiagnostics.storage.itemCounts).map(([key, count]) => (
                        <div key={key}>{key}: {count} items</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{
            background: 'rgba(23, 162, 184, 0.1)',
            padding: '1rem',
            borderRadius: '6px',
            border: '1px solid #17a2b8'
          }}>
            <h5 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>
              ℹ️ Monitoring Information
            </h5>
            <ul style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>
              <li>Health checks analyze storage, data integrity, and performance</li>
              <li>Performance monitoring tracks system metrics in real-time</li>
              <li>Monitoring data is stored locally and cleared on page refresh</li>
              <li>Regular health checks help identify issues before they become critical</li>
            </ul>
          </div>
        </div>
      )}

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
