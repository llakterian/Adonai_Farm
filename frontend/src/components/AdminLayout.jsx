import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth.js';

export default function AdminLayout({ children }) {
  const currentUser = getCurrentUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add admin-dashboard class to body when admin pages are loaded
    document.body.classList.add('admin-dashboard');
    
    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('admin-dashboard');
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.admin-header-fixed')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper function to determine if a tab is active
  const isActiveTab = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Admin navigation items for reuse
  const adminNavItems = [
    { path: '/dashboard', label: '🏡 Overview', ariaLabel: 'Dashboard Overview' },
    { path: '/dashboard/animals', label: '🐄 Livestock', ariaLabel: 'Livestock Management' },
    { path: '/dashboard/workers', label: '👨‍🌾 Staff', ariaLabel: 'Staff Management' },
    { path: '/dashboard/gallery', label: '📸 Gallery', ariaLabel: 'Photo Gallery' },
    { path: '/dashboard/reports', label: '📊 Reports', ariaLabel: 'Reports and Analytics' },
    { path: '/dashboard/infrastructure', label: '🏗️ Assets', ariaLabel: 'Infrastructure and Assets' }
  ];

  return (
    <div className="admin-container">
      {/* Skip Navigation Link for Accessibility */}
      <a href="#main-content" className="skip-navigation sr-only-focusable">
        Skip to main content
      </a>
      
      {/* Admin Header - Fixed Layout */}
      <header className="admin-header-fixed" role="banner">
        <div className="admin-header-content">
          <div className="admin-logo-section">
            <Link 
              to="/dashboard" 
              className="admin-logo-link"
              aria-label="Adonai Farm Management - Go to Dashboard"
            >
              🌾 Adonai Farm Management
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="admin-nav-tabs" role="navigation" aria-label="Admin Navigation">
            {adminNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-tab ${isActiveTab(item.path) ? 'active' : ''}`}
                aria-current={isActiveTab(item.path) ? 'page' : undefined}
                aria-label={item.ariaLabel}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle - High Contrast Agricultural Theme */}
          <button 
            className="admin-mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle admin navigation menu"
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="admin-user-section" role="region" aria-label="User Account">
            <div className="admin-user-info">
              <span className="admin-user-name" aria-label="Current user">
                {currentUser?.name || 'Admin'}
              </span>
              <span className="admin-user-role" aria-label="User role">
                ({currentUser?.role || 'admin'})
              </span>
            </div>
            
            <div className="admin-actions">
              <Link 
                to="/" 
                className="btn-view-public"
                aria-label="View public website"
              >
                🌐 View Site
              </Link>
              <button 
                onClick={handleLogout}
                className="btn-logout"
                aria-label="Logout from admin panel"
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <nav className={`admin-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile Admin Navigation">
        {adminNavItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-mobile-item ${isActiveTab(item.path) ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-current={isActiveTab(item.path) ? 'page' : undefined}
            aria-label={item.ariaLabel}
          >
            {item.label}
          </Link>
        ))}
        
        <div className="admin-mobile-actions">
          <Link 
            to="/" 
            className="admin-mobile-btn btn-view-public"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="View public website"
          >
            🌐 View Site
          </Link>
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="admin-mobile-btn btn-logout"
            aria-label="Logout from admin panel"
            type="button"
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="admin-content" role="main" id="main-content">
        {children}
      </main>
    </div>
  );
}