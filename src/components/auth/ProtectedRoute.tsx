import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    // Not logged in, redirect to landing page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in, but does not have the required role, redirect to their default dashboard
    // This is a simple way to handle it. A more complex app might show an "Access Denied" page.
    if (user.role === 'patient') {
      return <Navigate to="/patient-dashboard" replace />;
    }
    // Default for staff
    return <Navigate to="/staff-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
