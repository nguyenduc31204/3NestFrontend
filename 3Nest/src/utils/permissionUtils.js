/**
 * Kiểm tra xem người dùng có quyền cụ thể không.
 * @param {object} user - Đối tượng người dùng, chứa mảng permissions.
 * @param {string} requiredPermission - Chuỗi quyền cần kiểm tra (định dạng 'resource:action').
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermission) => {
  if (!user.permissions) {
    return true; // fallback nếu không có quyền rõ ràng (ví dụ admin)
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

    // full control luôn được phép
    if (currentPermissionName === 'full control') return true;

    // quyền "manage" bao gồm cả "review" và "view"
    if (currentPermissionName === 'manage' &&
      (requiredName === 'manage' || requiredName === 'review' || requiredName === 'view')) {
      return true;
    }

    // quyền "review" bao gồm cả "view"
    if (currentPermissionName === 'review' &&
      (requiredName === 'review' || requiredName === 'view')) {
      return true;
    }

    return currentPermissionName === requiredName;
  });
};


/**
 * Kiểm tra xem người dùng có quyền truy cập vào loại tài nguyên không.
 * @param {object} user - Đối tượng người dùng.
 * @param {string} resourceType - Loại tài nguyên (VD: 'user', 'order').
 * @returns {boolean}
 */
export const canAccess = (user, resourceType) => {
  if (!user || !Array.isArray(user.permissions)) return false;
  if (!resourceType || typeof resourceType !== 'string') return false;

  return user.permissions.some(
    p => p.permission_type_name?.toLowerCase() === resourceType.toLowerCase()
  );
};
