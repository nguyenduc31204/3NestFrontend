import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../../utils/apiPath';

const UserDetail = () => {
  const { userId } = useParams(); // Lấy userId từ URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/get-user?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });

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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="p-4 text-gray-600">Empty</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">User Detail</h2>
      <div className="space-y-2 text-gray-800">
        {/* <p><strong>ID:</strong> {user.user_id}</p> */}
        <p><strong>UserName:</strong> {user.user_name}</p>
        <p><strong>Email:</strong> {user.user_email}</p>
        <p><strong>Company:</strong> {user.company_name}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status ? 'Active' : 'Inactive'}</p>
        <p><strong>CreateAt:</strong> {user.created_at}</p>
        
        {/* <p><strong>CreateBy:</strong> {user.created_by}</p> */}
      </div>
    </div>
  );
};

export default UserDetail;
