import React, { Suspense, useEffect, startTransition } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// Lazy load admin components - these will only be loaded when needed
const AdminLayout = React.lazy(() => import('./components/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Breeding = React.lazy(() => import('./pages/Breeding'));
const Workers = React.lazy(() => import('./pages/Workers'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Account = React.lazy(() => import('./pages/Account'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Users = React.lazy(() => import('./pages/Users'));
const Infrastructure = React.lazy(() => import('./pages/Infrastructure'));
const ContactManagement = React.lazy(() => import('./pages/ContactManagement'));
const PublicContentManagement = React.lazy(() => import('./pages/PublicContentManagement'));

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
    <Suspense fallback={<AdminLoadingSpinner />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  ) : <Navigate to="/login" replace />;
}

export default function App() {
  const isAuthenticated = requireAuth();

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

  // Example: If you have custom navigation handlers, wrap in startTransition
  // (No direct navigation handler in this file, so no changes needed here)

  return (
    <ErrorBoundary>
      <div className="app">
        <main>
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
              <ErrorBoundary>
                <PrivateRoute><Dashboard /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/animals" element={
              <ErrorBoundary>
                <PrivateRoute><Animals /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/breeding" element={
              <ErrorBoundary>
                <PrivateRoute><Breeding /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/workers" element={
              <ErrorBoundary>
                <PrivateRoute><Workers /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/reports" element={
              <ErrorBoundary>
                <PrivateRoute><Reports /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/account" element={
              <ErrorBoundary>
                <PrivateRoute><Account /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/inventory" element={
              <ErrorBoundary>
                <PrivateRoute><Inventory /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/users" element={
              <ErrorBoundary>
                <PrivateRoute><Users /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/infrastructure" element={
              <ErrorBoundary>
                <PrivateRoute><Infrastructure /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/gallery" element={
              <ErrorBoundary>
                <PrivateRoute><Gallery /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/contact" element={
              <ErrorBoundary>
                <PrivateRoute><ContactManagement /></PrivateRoute>
              </ErrorBoundary>
            } />
            <Route path="/dashboard/public-content" element={
              <ErrorBoundary>
                <PrivateRoute><PublicContentManagement /></PrivateRoute>
              </ErrorBoundary>
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
        </main>
      </div>
    </ErrorBoundary>
  );
}