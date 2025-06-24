import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LuChevronLeft } from 'react-icons/lu';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/get-user?user_id=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Không thể lấy dữ liệu người dùng.');
      const result = await response.json();
      setUser(result.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải dữ liệu người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/roles/get-roles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await res.json();
      if (data.status_code === 200) {
        setRoles(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const getRoleName = (roleId) => {
    if (!roles || roles.length === 0) return 'Loading...';
    const role = roles.find(r => r.role_id === roleId);
    return role?.role_name || 'Unknown';
  };

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, [userId]);

  return (
    <>
     
        <div className="my-5 mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-1 mr-3 text-gray-500 hover:text-gray-700"
              >
                <LuChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">User Detail</h1>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && user && (
              <div className="space-y-4 text-gray-800">
                <p><strong>Username:</strong> {user.user_name}</p>
                <p><strong>Email:</strong> {user.user_email}</p>
                <p><strong>Company:</strong> {user.company_name}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Role:</strong> {getRoleName(user.role_id)}</p>
                <p><strong>Status:</strong> {user.status === true ? 'Active' : 'Inactive'}</p>
                <p><strong>Created At:</strong> {user.created_at}</p>
              </div>
            )}
          </div>
        </div>
    
    </>
  );
};

export default UserDetail;
