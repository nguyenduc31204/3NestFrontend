import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
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
    return <div className="p-8 text-center text-red-600">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <>
      
        <div className="my-5 mx-auto max-w-4xl">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">Roles</h1>
            {hasPermission(user, 'role:manage') && (
              <button
                onClick={() => navigate('/roles/add')}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                + Add Role
              </button>
            )}
          </div>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          <div className="bg-white shadow rounded-lg">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Detail</th> 
                  {hasPermission(user, 'role:manage') && (
                  <th className="px-4 py-2">Actions</th> 
                  )}
                </tr>
              </thead>

              <tbody>
                {roles.map((role, i) => (
                  <tr key={role.role_id} className="border-t">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{role.role_name}</td>
                    <td className="px-4 py-2">{role.role_description}</td>

                    {/* Detail column */}
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(`/roles/detail/${role.role_id}`)}
                        className="text-gray-700 hover:text-blue-600 hover:underline"
                      >
                        Detail
                      </button>
                    </td>

                    {/* Actions column: only Edit and Delete */}
                    {hasPermission(user, 'role:manage') && (
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => navigate(`/roles/edit/${role.role_id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role.role_id)}
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
        </div>
     
    </>
  );
};

export default RoleList;
