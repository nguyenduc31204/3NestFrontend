import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../utils/apiPath';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Đổi tên hàm thành refreshUser để rõ nghĩa hơn, logic bên trong không đổi
  const refreshUser = useCallback(async () => {
    // Khi bắt đầu refresh, luôn đặt lại trạng thái loading
    setIsLoading(true); 
    try {
      // BƯỚC 1: LẤY THÔNG TIN CƠ BẢN VÀ role_id
      const myInfoResponse = await fetch(`${BASE_URL}/users/my-info`,
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!myInfoResponse.ok) {
        // Nếu không lấy được info, có nghĩa là user đã logout hoặc token hết hạn
        setUser(null);
        return; // Dừng lại ở đây
      }
      const myInfoData = await myInfoResponse.json();
      const basicUserInfo = myInfoData.data;
      const roleId = basicUserInfo.role_id;

      // BƯỚC 2: DÙNG role_id ĐỂ LẤY QUYỀN CHI TIẾT
      const permissionsResponse = await fetch(`${BASE_URL}/permissions/get-permisisons-by-role?role_id=${roleId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!permissionsResponse.ok) throw new Error('Không thể lấy được danh sách quyền.');
      const permissionsData = await permissionsResponse.json();
      const detailedPermissions = permissionsData.data;

      // KẾT HỢP DỮ LIỆU ĐỂ TẠO USER HOÀN CHỈNH
      const finalUser = {
        id: basicUserInfo.user_id,
        name: basicUserInfo.full_name,
        role_id: roleId,
        role_name: detailedPermissions.role_name,
        permissions: detailedPermissions.permissions,
      };
      setUser(finalUser);
      console.log("Thông tin người dùng đã được làm mới:", finalUser);
    } catch (err) {
      console.error("Lỗi khi làm mới thông tin người dùng:", err);
      setError(err.message);
      setUser(null); // Nếu có lỗi, coi như chưa đăng nhập
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Khi component mount, tự động chạy refreshUser một lần
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = () => {
    console.log("AuthProvider: Performing logout.");
    localStorage.removeItem('access_token');
    localStorage.removeItem('user'); 
    localStorage.removeItem('role');

    setUser(null);
  };

  const value = {
    user,
    isLoading,
    error,
    refreshUser, 
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};