import React, { useState, useEffect } from 'react';
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
    role_id: '',
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <DashboardLayout activeMenu="06">
        <div className="max-w-2xl mx-auto my-8">
          <h1 className="text-xl font-semibold mb-4">Add User</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <input name="user_name" value={formData.user_name} onChange={handleChange} placeholder="User Name" className="w-full border px-3 py-2 rounded" required />
            <input name="user_email" value={formData.user_email} onChange={handleChange} placeholder="Email" className="w-full border px-3 py-2 rounded" required />
            <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company Name" className="w-full border px-3 py-2 rounded" />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full border px-3 py-2 rounded" required />
            <select name="role_id" value={formData.role_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" required>
              <option value="">Select Role</option>
              {roles.map(role => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
            </select>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 bg-gray-300 text-gray-700 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AddUser;
