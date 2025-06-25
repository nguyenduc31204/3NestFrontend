import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DasboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    company_name: '',
    phone: '',
    status: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/users/get-user?user_id=${userId}`,
          {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        const result = await res.json();
        if (res.ok && result.status_code === 200 && result.data) {
          const u = result.data;
          setFormData({
            user_id: u.user_id,
            user_name: u.user_name || '',
            company_name: u.company_name || '',
            phone: u.phone || '',
            status: u.status === false,
          });
          setLoading(false);
        } else {
          setError('User not found');
          setLoading(false);
        }
      } catch (err) {
        setError('Error loading user');
        setLoading(false);
      }
    };
    fetchUser();
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
    setError('');
    setSuccess('');

    const payload = {
      user_id: formData.user_id,
      user_name: formData.user_name,
      company_name: formData.company_name,
      phone: formData.phone,
      status: !!formData.status,
    };

    console.log('Submitting payload:', payload);

    try {
      const res = await fetch(`${BASE_URL}/users/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log('Update user response:', result);

      if (res.ok && result.status_code === 200) {
        setSuccess('User updated successfully');
        setTimeout(() => navigate('/users'), 1000);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-4">Loadinggg...</p>;
  console.log('userId', userId);

  return (
    <>
      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4">Update User</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default EditUser;
