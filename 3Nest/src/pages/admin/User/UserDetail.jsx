
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LuChevronLeft,
} from 'react-icons/lu';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/users/get-user?user_id=${userId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu người dùng.');
        }
        const result = await response.json();
        setUser(result.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Lỗi khi tải dữ liệu người dùng.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  return (
    <>
      <Header />
      <DashboardLayout activeMenu="05">
        <div className="my-5 mx-auto max-w-3xl">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/users')}
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
                <p><strong>User ID:</strong> {user.user_id}</p>
                <p><strong>Username:</strong> {user.user_name}</p>
                <p><strong>Email:</strong> {user.user_email}</p>
                <p><strong>Company:</strong> {user.company_name}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.status ? 'Active' : 'Inactive'}</p>
                <p><strong>Created At:</strong> {user.created_at}</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default UserDetail;
