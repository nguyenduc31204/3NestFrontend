
/**
 * @param {object} user - Đối tượng người dùng, chứa mảng permissions.
 * @param {string} requiredPermission - Chuỗi quyền cần kiểm tra (định dạng 'resource:action').
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermission) => {
    if (!user.permission) {
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
    const currentPermissionName = p.permission_name.toLowerCase();

    return typeMatch && (currentPermissionName === requiredName || currentPermissionName === 'full control');
  });
};


export const canAccess = (user, resourceType) => {
  if (!user || !Array.isArray(user.permissions)) {
    return false;
  }
  const type = resourceType.toLowerCase();
  return user.permissions.some(p => p.permission_type_name.toLowerCase() === type);
};