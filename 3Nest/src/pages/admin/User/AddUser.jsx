
import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    company_name: '',
    password: '',

    role_id: 0

  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${BASE_URL}/roles/get-roles`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const data = await res.json();
        if (data.status_code === 200) setRoles(data.data);
      } catch (err) {
        setError('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/roles/get-roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch roles');  
      }
      const result = await response.json();
      setRole(result.data || []);
    } catch (err) {
      console.error('Error loading roles:', err);
      setError(err.message || 'An error occurred while loading roles');
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  console.log('Available roles:', role);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

    try {
      const res = await fetch(`${BASE_URL}/users/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create user');
      navigate('/users');
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <>
      <Header />
      {/* <DasboardLayout activeMenu="05"> */}
        <div className="my-5 mx-auto max-w-3xl">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
              <div className="text-gray-500 text-sm">
                <a href="/" className="hover:underline">Dashboard</a> / <a href="/users" className="hover:underline">Users</a> / Add User
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white shadow rounded-lg p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                <input
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  placeholder="Enter user name"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="user_email"
                  type="email"
                  value={formData.user_email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter company"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role_id"
                  value={Number(formData.role_id)}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select role</option>
                  {role.map(r => (
                    <option key={r.role_id} value={parseInt(r.role_id)}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      {/* </DashboardLayout> */}
    </>
  );
};

export default AddUser;
