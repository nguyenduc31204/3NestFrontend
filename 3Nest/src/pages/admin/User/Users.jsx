import React, { useEffect, useState } from 'react';

import { FiEdit, FiTrash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';

import { BASE_URL } from '../../../utils/apiPath';
import { hasPermission } from '../../../utils/permissionUtils';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
  const paginatedUsers = users.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
  );

const totalPages = Math.ceil(users.length / itemsPerPage);

 const canManage = hasPermission(user, 'user:manage') || hasPermission(user, 'user:full control');

  return (
  <div className="my-5 mx-auto w-full px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="flex justify-between mb-4">
      <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
      {canManage && (
        <button
          onClick={() => navigate('/users/add')}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
        >
          + Add User
        </button>
      )}
    </div>

    {/* Error */}
    {error && <div className="mb-4 text-red-600">{error}</div>}

    {/* Table */}
    <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
      <table className="min-w-full table-auto text-sm">
        <thead>
          <tr className="bg-gray-200 text-left text-gray-800 uppercase tracking-wider">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Detail</th>
            {canManage && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {paginatedUsers.map((u, i) => (
            <tr key={u.user_id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>

              <td className="px-4 py-3">{u.user_name}</td>
              <td className="px-4 py-3">{u.user_email}</td>
              <td className="px-4 py-3">{u.company_name}</td>
              <td className="px-4 py-3">{getRoleName(u.role_id)}</td>

              <td className="px-4 py-3">
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
                <td className="px-4 py-3 space-x-8">
                  <button
                    onClick={() => navigate(`/users/edit/${u.user_id}`)}
                    title="Edit"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(u.user_id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
      {totalPages > 1 && (
        <div className="flex justify-end mt-4 space-x-2 text-sm text-gray-700">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default Users;
