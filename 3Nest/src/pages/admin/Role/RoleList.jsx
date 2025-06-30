import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import { FiEdit, FiTrash } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { hasPermission } from '../../../utils/permissionUtils';


const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
 
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchRoles(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRoles = async (currentUser = user) => {
  if (!currentUser || !hasPermission(currentUser, 'role:view')) return;

  try {
    const res = await fetch(`${BASE_URL}/roles/get-roles`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    const data = await res.json();
    if (data.status_code === 200 && Array.isArray(data.data)) {
      setRoles(data.data);
    } else {
      setError(data.message || 'Failed to load roles');
    }
  } catch (err) {
    setError('Failed to load roles');
  }
};



  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this role?')) return;
    try {
      const res = await fetch(`${BASE_URL}/roles/delete-role?request_id=${id}`, {
        method: 'DELETE',
        headers: {
            'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      fetchRoles();
      console.log(res);
      
      
    } catch (err) {
      setError('Failed to delete role');
    }
  };

  // useEffect(() => {
  //   fetchRoles();
  // }, []);
  if (!user) return <div className="p-8 text-center">Initializing…</div>;

  if (!hasPermission(user, 'role:view')) {
    return <div className="p-8 text-center text-red-600">Do not have permission accessing</div>;
  }

  return (
  <>
    <div className="my-5 mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 className="text-xl font-semibold">Roles Management</h1>
        {hasPermission(user, 'role:manage') && (
          <button
            onClick={() => navigate('/roles/add')}
            className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            + Add Role
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left text-sm text-gray-800">
              <th className="px-4 py-2 whitespace-nowrap">#</th>
              <th className="px-4 py-2 whitespace-nowrap">Name</th>
              <th className="px-4 py-2 whitespace-nowrap">Description</th>
              <th className="px-4 py-2 whitespace-nowrap">Detail</th>
              {hasPermission(user, 'role:manage') && (
                <th className="px-4 py-2 whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {roles.map((role, i) => (
              <tr key={role.role_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{role.role_name}</td>
                <td className="px-4 py-2">{role.role_description}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => navigate(`/roles/detail/${role.role_id}`)}
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    Detail
                  </button>
                </td>
                {hasPermission(user, 'role:manage') && (
                  <td className="px-4 py-2 space-x-6">
                    <button
                      onClick={() => navigate(`/roles/edit/${role.role_id}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(role.role_id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
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
    </div>
  </>
);

};

export default RoleList;
