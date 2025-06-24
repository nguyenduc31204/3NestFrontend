/**
 * Kiểm tra xem người dùng có quyền cụ thể không.
 * @param {object} user - Đối tượng người dùng, chứa mảng permissions.
 * @param {string} requiredPermission - Chuỗi quyền cần kiểm tra (định dạng 'resource:action').
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermission) => {
  // 🚧 Bỏ kiểm tra quyền nếu đang test
  // return true;

  if (!user || !Array.isArray(user.permissions)) return false;
  if (!requiredPermission || typeof requiredPermission !== 'string') return false;

  const [requiredType, requiredAction] = requiredPermission.toLowerCase().split(':');
  if (!requiredType || !requiredAction) return false;

  return user.permissions.some(p => {
    const typeMatch = p.permission_type_name?.toLowerCase() === requiredType;
    const nameMatch =
      p.permission_name?.toLowerCase() === requiredAction ||
      p.permission_name?.toLowerCase() === 'full control';

    return typeMatch && nameMatch;
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
