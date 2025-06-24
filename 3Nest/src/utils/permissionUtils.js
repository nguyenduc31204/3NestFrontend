
/**
 * @param {object} user - Đối tượng người dùng, chứa mảng permissions.
 * @param {string} requiredPermission - Chuỗi quyền cần kiểm tra (định dạng 'resource:action').
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermission) => {
    if (!user.permissions) {
      return true;
    }
  if (!user || !Array.isArray(user.permissions)) {
    return false;
  }
  const parts = requiredPermission.split(':');
  if (parts.length !== 2) return false;
  
  const requiredType = parts[0].toLowerCase();
  const requiredName = parts[1].toLowerCase();

  return user.permissions.some(p => {
    const typeMatch = p.permission_type_name.toLowerCase() === requiredType;
    if (!typeMatch) return false;

    const currentPermissionName = p.permission_name.toLowerCase(); 

    if (currentPermissionName === 'full control') {
      return true;
    }

    if (currentPermissionName === 'manage' && 
        (requiredName === 'manage' || requiredName === 'review' || requiredName === 'view')) {
      return true;
    }
    
    if (currentPermissionName === 'review' &&
        (requiredName === 'review' || requiredName === 'view')) {
      return true;
    }
    return currentPermissionName === requiredName;
  });
};




export const canAccess = (user, resourceType) => {
  if (!user || !Array.isArray(user.permissions)) {
    return false;
  }
  const type = resourceType.toLowerCase();
  return user.permissions.some(p => p.permission_type_name.toLowerCase() === type);
};