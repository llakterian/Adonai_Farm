import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import Gallery from './pages/Gallery';
import Reports from './pages/Reports';
import Account from './pages/Account';
import Workers from './pages/Workers';
import Login from './pages/Login';
import './styles.css';
import './mobile-fix.css';

function requireAuth() { 
  return !!localStorage.getItem('adonai_token'); 
}

function Protected({ children }) { 
  if (!requireAuth()) return <Navigate to="/login" replace />; 
  return children; 
}

function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('adonai_token');
    window.location.href = '/login';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">🌾 Adonai Farm</div>
        
        {/* Desktop Navigation */}
        <nav className="nav">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            🏠 Dashboard
          </Link>
          <Link to="/animals" className={isActive('/animals') ? 'active' : ''}>
            🐄 Animals
          </Link>
          <Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>
            📸 Gallery
          </Link>
          <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>
            📊 Reports
          </Link>
          <Link to="/workers" className={isActive('/workers') ? 'active' : ''}>
            👷 Workers
          </Link>
          <Link to="/account" className={isActive('/account') ? 'active' : ''}>
            👤 Account
          </Link>
          <button className="btn btn-outline" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={isActive('/') ? 'active' : ''} 
            onClick={closeMobileMenu}
          >
            🏠 Dashboard
          </Link>
          <Link 
            to="/animals" 
            className={isActive('/animals') ? 'active' : ''} 
            onClick={closeMobileMenu}
          >
            🐄 Animals
          </Link>
          <Link 
            to="/gallery" 
            className={isActive('/gallery') ? 'active' : ''} 
            onClick={closeMobileMenu}
          >
            📸 Gallery
          </Link>
          <Link 
            to="/reports" 
            className={isActive('/reports') ? 'active' : ''} 
            onClick={closeMobileMenu}
          >
            📊 Reports
          </Link>
          <Link 
            to="/workers" 
            className={isActive('/workers') ? 'active' : ''} 
            onClick={closeMobileMenu}
          >
            👷 Workers
          </Link>
          <Link 
            to="/account" 
            className={isActive('/account') ? 'active' : ''} 
            onClick={closeMobileMenu}
          >
            👤 Account
          </Link>
          <button className="btn btn-outline" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to Adonai Farm</h1>
        <p>Managing our livestock with care, precision, and modern technology for sustainable farming excellence.</p>
      </div>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = requireAuth();

  return (
    <div className="app">
      {isAuthenticated && !isLoginPage && <Header />}
      {isAuthenticated && !isLoginPage && location.pathname === '/' && <HeroSection />}
      
      <main className={isAuthenticated && !isLoginPage ? "main-content" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/animals" element={<Protected><Animals /></Protected>} />
          <Route path="/gallery" element={<Protected><Gallery /></Protected>} />
          <Route path="/reports" element={<Protected><Reports /></Protected>} />
          <Route path="/workers" element={<Protected><Workers /></Protected>} />
          <Route path="/account" element={<Protected><Account /></Protected>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}
