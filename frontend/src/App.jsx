import React, { Suspense, useEffect, startTransition } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary, { PublicErrorBoundary } from './components/ErrorBoundary';
import { PublicRoute, AuthenticatedPublicRoute } from './components/RouteProtection';
import { initializeSecurity } from './utils/security.js';
import PublicLayout from './components/PublicLayout';

// Lazy load public pages for better initial load performance
const Homepage = React.lazy(() => import('./pages/Homepage'));
const About = React.lazy(() => import('./pages/About'));
const Services = React.lazy(() => import('./pages/Services'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Animals = React.lazy(() => import('./pages/Animals'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const TaskChecklist = React.lazy(() => import('./pages/TaskChecklist'));
const Brochure = React.lazy(() => import('./pages/Brochure'));

// Lazy load auth pages
const Login = React.lazy(() => import('./pages/Login'));

// Admin components (eagerly loaded for reliability)
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Breeding from './pages/Breeding';
import Workers from './pages/Workers';
import Reports from './pages/Reports';
import Account from './pages/Account';
import Inventory from './pages/Inventory';
import Users from './pages/Users';
import Infrastructure from './pages/Infrastructure';
import ContactManagement from './pages/ContactManagement';
import PublicContentManagement from './pages/PublicContentManagement';

import { isAuthenticated, refreshSession, isSessionExpiringSoon, logSecurityEvent } from './auth.js';

function requireAuth() {
  return isAuthenticated();
}

// Loading components for different contexts
const PublicLoadingSpinner = () => (
  <div className="loading-container public-loading">
    <div className="loading-spinner">
      <div className="spinner-icon">🌾</div>
      <p>Loading Adonai Farm...</p>
    </div>
  </div>
);

const AdminLoadingSpinner = () => (
  <div className="loading-container admin-loading">
    <div className="loading-spinner">
      <div className="spinner-icon">⚙️</div>
      <p>Loading Dashboard...</p>
    </div>
  </div>
);

function PrivateRoute({ children }) {
  const isAuthenticated = requireAuth();
  return isAuthenticated ? (
    <AdminLayout>{children}</AdminLayout>
  ) : <Navigate to="/login" replace />;
}

export default function App() {
  const isAuthenticated = requireAuth();
  const location = useLocation();

  // Initialize security system
  useEffect(() => {
    initializeSecurity();
    console.log('🔒 Security system initialized for Adonai Farm');
  }, []);

  // Session management - check for expiring sessions
  React.useEffect(() => {
    if (isAuthenticated) {
      const checkSession = () => {
        if (!requireAuth()) {
          // Session expired, redirect to login
          logSecurityEvent('session_expired', { reason: 'automatic_logout' });
          window.location.href = '/login';
          return;
        }

        if (isSessionExpiringSoon()) {
          // Show warning and refresh session
          const shouldRefresh = window.confirm(
            'Your session will expire in 30 minutes. Would you like to extend it?'
          );
          if (shouldRefresh) {
            refreshSession();
            logSecurityEvent('session_refreshed', { method: 'user_prompt' });
          }
        }
      };

      // Check session every 5 minutes
      const sessionInterval = setInterval(checkSession, 5 * 60 * 1000);

      // Initial check
      checkSession();

      return () => clearInterval(sessionInterval);
    }
  }, [isAuthenticated]);

  // Wrap routes in Suspense so lazy pages don't trigger ErrorBoundary
  return (
    <ErrorBoundary key={location.pathname}>
      <div className="app">
        <main>
          <Suspense fallback={<PublicLoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Homepage />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="animals" element={<Animals />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="contact" element={<Contact />} />
                <Route path="tasks" element={<TaskChecklist />} />
                <Route path="brochure" element={<Brochure />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Login />} />
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/dashboard/animals" element={
                <PrivateRoute><Animals /></PrivateRoute>
              } />
              <Route path="/dashboard/breeding" element={
                <PrivateRoute><Breeding /></PrivateRoute>
              } />
              <Route path="/dashboard/workers" element={
                <PrivateRoute><Workers /></PrivateRoute>
              } />
              <Route path="/dashboard/reports" element={
                <PrivateRoute><Reports /></PrivateRoute>
              } />
              <Route path="/dashboard/account" element={
                <PrivateRoute><Account /></PrivateRoute>
              } />
              <Route path="/dashboard/inventory" element={
                <PrivateRoute><Inventory /></PrivateRoute>
              } />
              <Route path="/dashboard/users" element={
                <PrivateRoute><Users /></PrivateRoute>
              } />
              <Route path="/dashboard/infrastructure" element={
                <PrivateRoute><Infrastructure /></PrivateRoute>
              } />
              <Route path="/dashboard/gallery" element={
                <PrivateRoute><Gallery /></PrivateRoute>
              } />
              <Route path="/dashboard/contact" element={
                <PrivateRoute><ContactManagement /></PrivateRoute>
              } />
              <Route path="/dashboard/public-content" element={
                <PrivateRoute><PublicContentManagement /></PrivateRoute>
              } />

              {/* 404 Not Found Route */}
              <Route path="*" element={
                <PublicErrorBoundary componentName="NotFound">
                  <Suspense fallback={<PublicLoadingSpinner />}>
                    <NotFound />
                  </Suspense>
                </PublicErrorBoundary>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}