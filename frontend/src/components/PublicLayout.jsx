import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../auth.js';
import { startTransition } from 'react';

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
            <img src="/images/logo.svg" alt="Adonai Farm Logo" style={{ height: 60, verticalAlign: 'middle' }} />
            &nbsp;Adonai Farm
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
  return (
    <footer className="public-footer" role="contentinfo">
      <div className="public-footer-content">
        <section className="footer-section" aria-labelledby="farm-info">
          <h3 id="farm-info">🌾 Adonai Farm</h3>
          <p>Managing livestock with care, precision, and modern technology for sustainable farming excellence.</p>
        </section>

        <section className="footer-section" aria-labelledby="quick-links">
          <h4 id="quick-links">Quick Links</h4>
          <nav aria-label="Footer navigation">
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/animals">Our Animals</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
        </section>

        <section className="footer-section" aria-labelledby="contact-info">
          <h4 id="contact-info">Contact Info</h4>
          <address>
            <p>📧 <a href="mailto:info@adonaifarm.co.ke">info@adonaifarm.co.ke</a></p>
            <p>📞 <a href="tel:+254722759217">+254 722 759 217</a></p>
            <p>📍 Chepsir, Kericho, Kenya</p>
          </address>
        </section>

        <section className="footer-section" aria-labelledby="social-media">
          <h4 id="social-media">Follow Us</h4>
          <div className="social-links">
            <a href="#" aria-label="Follow us on Facebook">📘</a>
            <a href="#" aria-label="Follow us on Instagram">📷</a>
            <a href="#" aria-label="Follow us on Twitter">🐦</a>
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Adonai Farm. All rights reserved.</p>
        <p>Built by <a href="mailto:triolinkl@gmail.com" className="triolink-credit">TrioLink</a> - Want a system like this? Contact us!</p>
      </div>
    </footer>
  );
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