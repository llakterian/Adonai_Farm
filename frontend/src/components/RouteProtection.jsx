import React from 'react';
import { Navigate } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import { RouteDataProtection } from '../utils/dataProtection.js';
import { securityMonitor } from '../utils/security.js';

function requireAuth() { 
  return !!localStorage.getItem('adonai_token'); 
}

// Component for public routes - shows public content for unauthenticated users
export function PublicRoute({ children }) {
  React.useEffect(() => {
    // Log public route access
    securityMonitor.logEvent('public_route_access', {
      route: window.location.pathname,
      authenticated: false
    });
    
    // Log data access for monitoring
    RouteDataProtection.logDataAccess('public_content', {
      route: window.location.pathname,
      userType: 'public'
    });
  }, []);

  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}

// Component for authenticated public routes - shows public content with admin options for authenticated users
export function AuthenticatedPublicRoute({ children }) {
  React.useEffect(() => {
    // Log authenticated public route access
    securityMonitor.logEvent('authenticated_public_route_access', {
      route: window.location.pathname,
      authenticated: true
    });
    
    // Log data access for monitoring
    RouteDataProtection.logDataAccess('public_content', {
      route: window.location.pathname,
      userType: 'authenticated_public'
    });
  }, []);

  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}

// Component for admin routes - requires authentication
export function PrivateRoute({ children }) {
  const isAuthenticated = requireAuth();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      // Log successful admin route access
      securityMonitor.logEvent('admin_route_access', {
        route: window.location.pathname,
        authenticated: true,
        success: true
      });
      
      // Log admin data access
      RouteDataProtection.logDataAccess('admin_content', {
        route: window.location.pathname,
        userType: 'admin'
      });
    } else {
      // Log unauthorized admin route access attempt
      securityMonitor.logEvent('unauthorized_admin_access', {
        route: window.location.pathname,
        authenticated: false,
        blocked: true
      });
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children; 
}

// Component for admin login route - redirects to dashboard if already authenticated
export function AdminLoginRoute({ children }) {
  const isAuthenticated = requireAuth();
  
  React.useEffect(() => {
    // Log login page access
    securityMonitor.logEvent('login_page_access', {
      route: window.location.pathname,
      authenticated: isAuthenticated,
      redirected: isAuthenticated
    });
  }, [isAuthenticated]);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Enhanced route protection with data filtering
export function SecureDataRoute({ children, dataType }) {
  React.useEffect(() => {
    // Validate route access and log
    const isAdminRoute = RouteDataProtection.isAdminRoute();
    const isAuthenticated = RouteDataProtection.isAuthenticated();
    
    securityMonitor.logEvent('secure_data_route_access', {
      route: window.location.pathname,
      dataType,
      isAdminRoute,
      isAuthenticated,
      accessGranted: isAdminRoute ? isAuthenticated : true
    });
    
    // Log specific data type access
    RouteDataProtection.logDataAccess(dataType, {
      route: window.location.pathname,
      accessLevel: isAdminRoute && isAuthenticated ? 'full' : 'public'
    });
  }, [dataType]);

  return children;
}