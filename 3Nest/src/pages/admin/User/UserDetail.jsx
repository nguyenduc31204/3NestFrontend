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
    <div className="my-6 mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">👤</span> User Detail
          </h1>
        </div>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-6">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && user && (
          <div className="space-y-4 text-gray-800">
            <div className="py-3 flex items-center space-x-3 border-b">
              <span>🧑</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Username:</span>
                <span className="text-gray-900">{user.user_name}</span>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3 border-b">
              <span>📧</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Email:</span>
                <span className="text-gray-900">{user.user_email}</span>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3 border-b">
              <span>🏢</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Company:</span>
                <span className="text-gray-900">{user.company_name}</span>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3 border-b">
              <span>📞</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Phone:</span>
                <span className="text-gray-900">{user.phone || '-'}</span>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3 border-b">
              <span>🛡️</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Role:</span>
                <span className="text-gray-900">{getRoleName(user.role_id)}</span>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3 border-b">
              <span>🟢</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Status:</span>
                <span className={user.status ? "text-green-600" : "text-red-600"}>
                  {user.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="py-3 flex items-center space-x-3">
              <span>📅</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[100px]">Created At:</span>
                <span className="text-gray-900">{user.created_at}</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => navigate('/users')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Back
              </button>
            </div>

          </div>

        )}
      </div>
    </div>
  </>
);

};

export default UserDetail;
