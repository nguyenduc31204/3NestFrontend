import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../../../utils/apiPath';

const EditUser = () => {
  const { userId } = useParams(); // lấy từ URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    company_name: '',
    status: false,
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/get-users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        const result = await res.json();
        const found = result.data.find(u => u.user_id == userId);
  
        if (found) {
          setFormData({
            user_id: found.user_id,
            user_name: found.user_name || '',
            company_name: found.company_name || '',
            phone: found.phone || '',
            status: found.status ?? false,
          });
          setLoading(false);
        } else {
          setError('User không tồn tại!');
          setLoading(false);
        }
      } catch (err) {
        setError('Lỗi khi tải dữ liệu người dùng');
        setLoading(false);
      }
    };
  
    fetchUserList();
  }, [userId]);
  
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/users/update-user`, {
        method: 'POST', // đúng theo Swagger
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Cập nhật thất bại!');
      setSuccess('Cập nhật người dùng thành công!');
      setTimeout(() => navigate('/users'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Update User</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="user_name"
          placeholder="Username"
          value={formData.user_name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />

        <input
          type="text"
          name="company_name"
          placeholder="Company"
          value={formData.company_name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleChange}
          />
          <span>Active</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditUser;
