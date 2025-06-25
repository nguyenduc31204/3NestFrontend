import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { hasPermission } from '../../../utils/permissionUtils';
const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
   const [user, setUser] = useState(null);

  const fetchRoles = async () => {
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
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.role_id === roleId);
    return role?.role_name || 'Unknown';
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/get-users`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await res.json();

      if (data.status_code === 200 && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const response = await fetch(`${BASE_URL}/users/delete-user?user_id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const result = await response.json();
      console.log("Delete user response:", result);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
    console.log("Delete user with ID:", id);
    console.log("Current users state:", users);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (hasPermission(parsedUser, 'user:view')) {
        fetchUsers();
        fetchRoles();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);
  if (!user) return <div className="p-8 text-center">Initializing…</div>;
  if (!hasPermission(user, 'user:view')) {
    return <div className="p-8 text-center text-red-600">Bạn không có quyền truy cập trang này.</div>;
  }

 const canManage = hasPermission(user, 'user:manage') || hasPermission(user, 'user:full control');

  return (
    <div className="my-5 mx-auto max-w-6xl">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Users</h1>
        {canManage && (
          <button onClick={() => navigate('/users/add')} className="px-4 py-2 bg-blue-600 text-white rounded">
            + Add User
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <table className="w-full table-auto bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Detail</th> 
            {canManage && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.user_id} className="border-t">
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{u.user_name}</td>
              <td className="px-4 py-2">{u.user_email}</td>
              <td className="px-4 py-2">{u.company_name}</td>
              <td className="px-4 py-2">{getRoleName(u.role_id)}</td>

              <td className="px-4 py-2">
                {hasPermission(user, 'user:view') && (
                  <button
                    onClick={() => navigate(`/users/detail/${u.user_id}`)}
                    className="text-green-600 hover:underline"
                  >
                    Detail
                  </button>
                )}
              </td>

            
              {canManage && (
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => navigate(`/users/edit/${u.user_id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.user_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Users;
