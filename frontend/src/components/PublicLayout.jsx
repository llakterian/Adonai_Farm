import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../auth.js';
import { startTransition } from 'react';
import Footer from './Footer';

function PublicHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAuthenticated = !!currentUser;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.public-header')) {
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const publicNavItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/animals', label: 'Our Animals' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' }
  ];

  // Example: Use startTransition for navigation if you use navigate() directly
  // (No direct navigate() in this file, so no changes needed here)

  return (
    <header className="public-header" role="banner">
      <div className="public-header-content">
        <div className="public-logo">
          <Link to="/" aria-label="Adonai Farm - Home" className="site-title">
            <img src="/images/adonai-logo-compact-new.svg" alt="Adonai Farm Logo" className="logo-image" />
          </Link>
        </div>

        <nav className="public-nav" role="navigation" aria-label="Main navigation">
          {publicNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'active' : ''}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-auth-section">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/admin" className="btn btn-outline">
              Admin Login
            </Link>
          )}
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

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {publicNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn btn-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/admin"
              className="btn btn-outline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return <Footer isAdmin={false} />;
}

export default function PublicLayout() {
  return (
    <div className="public-layout">
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <PublicHeader />

      <main id="main-content" className="public-main" role="main">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}