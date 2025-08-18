import React, { useState, useEffect } from 'react';
import { notificationSystem } from '../utils/notifications.js';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState(notificationSystem.settings);

  useEffect(() => {
    loadNotifications();
    
    // Set up periodic refresh
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    setNotifications(notificationSystem.getActiveNotifications());
  };

  const handleMarkAsRead = (id) => {
    notificationSystem.markAsRead(id);
    loadNotifications();
  };

  const handleDismiss = (id) => {
    notificationSystem.dismissNotification(id);
    loadNotifications();
  };

  const handleSettingsUpdate = (newSettings) => {
    notificationSystem.updateSettings(newSettings);
    setSettings({ ...settings, ...newSettings });
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    if (!showAll) {
      filtered = filtered.slice(0, 5); // Show only first 5 if not showing all
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'maintenance': return '🔧';
      case 'event': return '📅';
      case 'system': return '⚙️';
      case 'reminder': return '⏰';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const stats = notificationSystem.getStatistics();

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
          🔔 Notification Center
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </h2>
        
        {/* Statistics */}
        <div className="notification-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.unread}</span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.byPriority.critical + stats.byPriority.high}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>

        {/* Filters */}
        <div className="notification-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="maintenance">🔧 Maintenance</option>
            <option value="event">📅 Farm Events</option>
            <option value="system">⚙️ System</option>
            <option value="reminder">⏰ Reminders</option>
          </select>
          
          <button 
            className="btn btn-outline btn-small"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3>No notifications</h3>
            <p>You're all caught up! No {filter === 'all' ? '' : filter} notifications at this time.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}`}
            >
              <div className="notification-content">
                <div className="notification-header-item">
                  <div className="notification-icons">
                    {getPriorityIcon(notification.priority)}
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-time">{formatTimestamp(notification.timestamp)}</div>
                </div>
                
                <div className="notification-message">{notification.message}</div>
                
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="notification-data">
                    {notification.data.itemType && (
                      <span className="data-tag">Type: {notification.data.itemType}</span>
                    )}
                    {notification.data.daysUntil !== undefined && (
                      <span className="data-tag">Days: {notification.data.daysUntil}</span>
                    )}
                    {notification.data.hoursUntil !== undefined && (
                      <span className="data-tag">Hours: {notification.data.hoursUntil}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button 
                  className="btn btn-outline btn-small"
                  onClick={() => handleDismiss(notification.id)}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Panel */}
      <div className="notification-settings">
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
          ⚙️ Notification Settings
        </h3>
        
        <div className="settings-grid">
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={settings.maintenanceReminders}
                onChange={(e) => handleSettingsUpdate({ maintenanceReminders: e.target.checked })}
              />
              🔧 Maintenance Reminders
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={settings.farmEvents}
                onChange={(e) => handleSettingsUpdate({ farmEvents: e.target.checked })}
              />
              📅 Farm Events
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={settings.systemAlerts}
                onChange={(e) => handleSettingsUpdate({ systemAlerts: e.target.checked })}
              />
              ⚙️ System Alerts
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingsUpdate({ soundEnabled: e.target.checked })}
              />
              🔊 Browser Notifications
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              Reminder Days:
              <input 
                type="number" 
                min="1" 
                max="30"
                value={settings.reminderDays}
                onChange={(e) => handleSettingsUpdate({ reminderDays: parseInt(e.target.value) || 7 })}
                style={{ width: '60px', marginLeft: '0.5rem' }}
              />
            </label>
          </div>
        </div>
        
        <div className="settings-actions">
          <button 
            className="btn btn-outline btn-small"
            onClick={() => {
              notificationSystem.runAllChecks();
              loadNotifications();
            }}
          >
            🔄 Check Now
          </button>
          
          <button 
            className="btn btn-outline btn-small"
            onClick={() => {
              notificationSystem.clearOldNotifications();
              loadNotifications();
            }}
          >
            🗑️ Clear Old
          </button>
        </div>
      </div>

      <style jsx>{`
        .notification-center {
          max-width: 800px;
          margin: 0 auto;
        }

        .notification-header {
          margin-bottom: 2rem;
        }

        .notification-badge {
          background: var(--accent-red);
          color: white;
          border-radius: 50%;
          padding: 0.2rem 0.5rem;
          font-size: 0.8rem;
          margin-left: 0.5rem;
        }

        .notification-stats {
          display: flex;
          gap: 2rem;
          margin: 1rem 0;
          padding: 1rem;
          background: var(--card-bg);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary-green);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .notification-filters {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin: 1rem 0;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--card-bg);
        }

        .notifications-list {
          margin-bottom: 2rem;
        }

        .no-notifications {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .notification-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem;
          margin-bottom: 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          transition: all 0.2s ease;
        }

        .notification-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .notification-item.unread {
          border-left: 4px solid var(--primary-green);
          background: rgba(76, 175, 80, 0.05);
        }

        .notification-item.priority-critical {
          border-left-color: var(--accent-red);
          background: rgba(244, 67, 54, 0.05);
        }

        .notification-item.priority-high {
          border-left-color: #ff9800;
          background: rgba(255, 152, 0, 0.05);
        }

        .notification-content {
          flex: 1;
        }

        .notification-header-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .notification-icons {
          display: flex;
          gap: 0.25rem;
        }

        .notification-title {
          font-weight: bold;
          color: var(--text-primary);
          flex: 1;
        }

        .notification-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .notification-message {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .notification-data {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .data-tag {
          background: var(--primary-green);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: 1rem;
        }

        .notification-settings {
          background: var(--card-bg);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .setting-item label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .settings-actions {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .notification-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .notification-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .notification-item {
            flex-direction: column;
            gap: 1rem;
          }

          .notification-actions {
            margin-left: 0;
            justify-content: flex-end;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;