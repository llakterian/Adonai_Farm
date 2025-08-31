// frontend/src/components/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth.js';
import { notificationSystem } from '../utils/notifications';
import { startTransition } from 'react';
import Footer from './Footer';

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
                src="/images/adonai-logo-compact-new.svg"
                alt="Adonai Logo"
                className="admin-logo-svg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline-flex';
                }}
              />
              <span className="admin-brand-text">Adonai Farm</span>
              <div className="logo-fallback" style={{ display: 'none' }}>
                <span className="logo-icon">🌾</span>
                <span className="brand-text">Adonai Farm</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="admin-nav desktop-nav compact">
            {adminNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link compact ${isActive(item.path) ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="nav-label" aria-label={item.label}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="admin-user-menu">
            <div className="user-info">
              <span className="user-name">👤 {currentUser.name}</span>
              <span className="user-role">({currentUser.role === 'admin' ? 'Admin' : currentUser.role})</span>
            </div>
            <div className="user-actions">
              <Link to="/" className="btn btn-outline btn-sm" title="View Public Site">
                🌐 Public Site
              </Link>
              <button onClick={handleLogout} className="btn btn-logout btn-sm" title="Logout">
                Logout
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

        {/* Mobile/Tablet Horizontal Tab Bar */}
        <nav className="admin-nav-tabs" aria-label="Admin sections">
          {adminNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-tab ${isActive(item.path) ? 'active' : ''}`}
              title={item.label}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Render the child component passed from App.jsx */}
        {children}
      </main>

      {/* Admin Footer */}
      <Footer isAdmin={true} />
    </div>
  );
};

export default AdminLayout;