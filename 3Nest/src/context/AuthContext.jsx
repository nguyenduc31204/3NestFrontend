import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../utils/apiPath';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true); 
    try {
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
        return; 
      }
      const myInfoData = await myInfoResponse.json();
      const basicUserInfo = myInfoData.data;
      console.log("Thông tin cơ bản người dùng:", basicUserInfo);
      const roleId = basicUserInfo.role_id;

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

      const finalUser = {
        user_id: basicUserInfo.user_id,
        user_name: basicUserInfo.user_name,
        company_name: basicUserInfo.company_name,
        user_email: basicUserInfo.user_email,
        phone: basicUserInfo.phone,
        status: basicUserInfo.status,
        role_id: roleId,
        role_name: detailedPermissions.role_name,
        permissions: detailedPermissions.permissions,
      };
      setUser(finalUser);
      console.log("Thông tin người dùng đã được làm mới:", finalUser);
    } catch (err) {
      console.error("Lỗi khi làm mới thông tin người dùng:", err);
      setError(err.message);
      setUser(null); 
    } finally {
      setIsLoading(false);
    }
  }, []);

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