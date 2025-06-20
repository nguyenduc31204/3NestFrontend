import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission } from '../../utils/permissionUtils';

const ProtectedRoute = ({ children, permission }) => {
  const location = useLocation();
  
  const storedUserString = localStorage.getItem('user');
  const user = storedUserString ? JSON.parse(storedUserString) : null;
  console.log('ProtectedRoute user:', user);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(user, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;