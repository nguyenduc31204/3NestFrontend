/**
 * Kiểm tra xem người dùng có quyền cụ thể không.
 * @param {object} user - Đối tượng người dùng, chứa mảng permissions.
 * @param {string} requiredPermission - Chuỗi quyền cần kiểm tra (định dạng 'resource:action').
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermission) => {

  //console.log("Checking permission:", requiredPermission, "for user:", user);
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

  for (const p of user.permissions) {
    const typeMatch = p.permission_type_name.toLowerCase() === requiredType;

    if (typeMatch) {
      const currentPermissionName = p.permission_name.toLowerCase().trim(); 

      if (currentPermissionName === 'full control') {
        return true;
      }

      // Nếu quyền của user là 'manage', họ có quyền manage, review, và view
      if (currentPermissionName === 'manage' && 
          (requiredName === 'manage' || requiredName === 'view')) {
        return true;
      }
      
      // Nếu quyền của user là 'review', họ có quyền review và view
      if (currentPermissionName === 'review' &&
          (requiredName === 'review' || requiredName === 'view')) {
        return true;
      }
      
      // Trường hợp cuối: quyền phải khớp chính xác
      if (currentPermissionName === requiredName) {
        return true;
      }
    }
  }

  return false;
};


export const canAccess = (user, resourceType) => {
  if (!user || !Array.isArray(user.permissions)) return false;
  if (!resourceType || typeof resourceType !== 'string') return false;

  return user.permissions.some(
    p => p.permission_type_name?.toLowerCase() === resourceType.toLowerCase()
  );
};
