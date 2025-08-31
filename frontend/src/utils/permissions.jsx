// Permission checking utilities for role-based access control
import { getCurrentUser, getUserRole, canAccess, USER_ROLES } from '../auth.js';

// Higher-order component for protecting routes/components
export function withPermission(Component, requiredFeature) {
  return function ProtectedComponent(props) {
    const hasAccess = canAccess(requiredFeature);

    if (!hasAccess) {
      return (
        <div className="access-denied">
          <div className="access-denied-content">
            <h2>🚫 Access Denied</h2>
            <p>You don't have permission to access this feature.</p>
            <p>Required access level: {requiredFeature}</p>
            <p>Your role: {getUserRole()}</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for checking permissions in components
export function usePermissions() {
  const currentUser = getCurrentUser();
  const userRole = getUserRole();

  return {
    user: currentUser,
    role: userRole,
    canAccess: (feature) => canAccess(feature),
    isAdmin: () => userRole === USER_ROLES.ADMIN,
    isSupervisor: () => userRole === USER_ROLES.SUPERVISOR,
    isWorker: () => userRole === USER_ROLES.WORKER,
    hasRole: (role) => userRole === role,
    canEdit: (feature) => {
      // Define which roles can edit which features
      const editPermissions = {
        animals: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR],
        breeding: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR],
        workers: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR],
        infrastructure: [USER_ROLES.ADMIN],
        users: [USER_ROLES.ADMIN],
        reports: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR],
        gallery: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR]
      };

      return editPermissions[feature]?.includes(userRole) || false;
    },
    canDelete: (feature) => {
      // Define which roles can delete which features
      const deletePermissions = {
        animals: [USER_ROLES.ADMIN],
        workers: [USER_ROLES.ADMIN],
        infrastructure: [USER_ROLES.ADMIN],
        users: [USER_ROLES.ADMIN],
        gallery: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR]
      };

      return deletePermissions[feature]?.includes(userRole) || false;
    }
  };
}

// Component for conditionally rendering content based on permissions
export function PermissionGate({ feature, role, fallback = null, children }) {
  const { canAccess: hasAccess, hasRole } = usePermissions();

  let hasPermission = false;

  if (feature) {
    hasPermission = hasAccess(feature);
  } else if (role) {
    hasPermission = hasRole(role);
  }

  return hasPermission ? children : fallback;
}

// Utility function to get user-friendly role names
export function getRoleDisplayName(role) {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.SUPERVISOR]: 'Supervisor',
    [USER_ROLES.WORKER]: 'Worker'
  };

  return roleNames[role] || role;
}

// Utility function to get role-based dashboard content
export function getDashboardContent(role) {
  const dashboardContent = {
    [USER_ROLES.ADMIN]: {
      title: 'Admin Dashboard',
      description: 'Complete farm management overview',
      features: ['animals', 'workers', 'infrastructure', 'reports', 'users', 'gallery'],
      metrics: ['total_animals', 'active_workers', 'infrastructure_items', 'monthly_reports', 'system_users']
    },
    [USER_ROLES.SUPERVISOR]: {
      title: 'Farm Supervisor Dashboard',
      description: 'Operational management and oversight',
      features: ['animals', 'workers', 'reports', 'gallery'],
      metrics: ['total_animals', 'active_workers', 'weekly_reports', 'recent_activities']
    },
    [USER_ROLES.WORKER]: {
      title: 'Farm Worker Dashboard',
      description: 'Personal tasks and time tracking',
      features: ['animals_view', 'time_tracking', 'account'],
      metrics: ['hours_worked', 'tasks_completed', 'animals_assigned']
    }
  };

  return dashboardContent[role] || dashboardContent[USER_ROLES.WORKER];
}