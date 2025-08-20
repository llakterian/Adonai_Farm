// frontend/src/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth.js';
import { notificationSystem } from '../utils/notifications';
import { startTransition } from 'react';

const AdminLayout = ({ children }) => {
  const currentUser = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const notifications = await notificationSystem.getActiveNotifications();
      setNotifications(notifications);
    };
    loadNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!currentUser) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Access Denied</h2>
        <p>Please log in to access the admin dashboard.</p>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    );
  }

  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/animals', label: 'Animals', icon: '🐄' },
    { path: '/dashboard/breeding', label: 'Breeding', icon: '🐣' },
    { path: '/dashboard/workers', label: 'Workers', icon: '👥' },
    { path: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
    { path: '/dashboard/infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { path: '/dashboard/reports', label: 'Reports', icon: '📈' },
    { path: '/dashboard/gallery', label: 'Gallery', icon: '📸' },
    { path: '/dashboard/users', label: 'Users', icon: '👤' },
    { path: '/dashboard/account', label: 'Account', icon: '⚙️' }
  ];

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <Link to="/dashboard" className="admin-brand">
              <img
                src="/images/logo.svg"
                alt="Adonai Farm"
                className="admin-logo-svg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-flex';
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                <span className="logo-icon">🌾</span>
                <span className="brand-text">Adonai Farm</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="admin-nav desktop-nav">
            {adminNavItems.slice(0, 6).map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="admin-user-menu">
            <div className="user-info">
              <span className="user-name">👤 {currentUser.name}</span>
              <span className="user-role">({currentUser.role || 'Admin'})</span>
            </div>
            <div className="user-actions">
              <Link to="/" className="btn btn-outline btn-sm" title="View Public Site">
                🌐 Public Site
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm" title="Logout">
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`admin-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {adminNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          <div className="mobile-user-actions">
            <Link
              to="/"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">🌐</span>
              <span className="nav-label">Public Site</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="mobile-nav-link logout-btn"
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Render the child component passed from App.jsx */}
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="admin-footer">
        <div className="admin-footer-content">
          <p>&copy; 2025 Adonai Farm Management System</p>
          <p>Built by <a href="mailto:triolinkl@gmail.com">TrioLink</a></p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;