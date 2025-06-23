import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { hasPermission } from '../../utils/permissionUtils';

// === HÀM GIẢ LẬP ĐỂ CODE CÓ THỂ CHẠY ===
// Bạn nên thay thế bằng hàm thật của mình
// const hasPermission = (user, permission) => {
//   if (!permission) {
//     return true;
//   }

//   console.log(`Checking if user has permission: "${permission}"`);
//   return true; 
// };

const ProtectedRoute = ({ children, permission }) => {
  const location = useLocation();
  const storedUserString = localStorage.getItem('user');
  const user = storedUserString ? JSON.parse(storedUserString) : null;

  // 1. Kiểm tra đăng nhập 
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra quyền
  if (!hasPermission(user, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default ProtectedRoute;
