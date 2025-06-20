import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const AddRole = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ role_name: '', description: '' });
  const [error, setError] = useState(null);

  const [permissions, setPermissions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/permissions/get-permissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await res.json();
        if (result.status_code === 200) {
          setPermissions(result.data);
        } else {
          setError(result.message || 'Failed to fetch permissions');
        }
      } catch (err) {
        setError('Failed to load permissions');
      }
    };

    fetchPermissions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleType = (typeName) => {
  setSelectedTypes((prev) => ({
    ...prev,
    [typeName]: !prev[typeName],
  }));


  if (selectedTypes[typeName]) {
    const updated = { ...selectedPermissions };
    Object.entries(updated).forEach(([id]) => {
      const perm = permissions.find(p => p.permission_id === Number(id));
      if (perm?.permission_type_name === typeName) {
        delete updated[id];
      }
    });
    setSelectedPermissions(updated);
  }
};


  const handlePermissionSelect = (perm) => {
    
    setSelectedPermissions((prev) => {
      
      const updated = Object.entries(prev)
        .filter(([_, p]) => p.type !== perm.permission_type_name)
        .reduce((acc, [id, val]) => {
          acc[id] = val;
          return acc;
        }, {});
      updated[perm.permission_id] = {
        type: perm.permission_type_name,
      };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const selectedPermissionIds = Object.keys(selectedPermissions).map(Number);

        const payload = {
      ...formData,
      permissions: selectedPermissionIds,
    };

    console.log('Payload:', payload);

    try {
      
      const res = await fetch(`${BASE_URL}/roles/create-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          permissions: selectedPermissionIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create role');
        return;
      }

      navigate('/admin/roles');
    } catch (err) {
      setError(err.message);
    }
  };


  const grouped = permissions.reduce((acc, perm) => {
    const type = perm.permission_type_name;
    if (!acc[type]) acc[type] = [];
    acc[type].push(perm);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <DashboardLayout activeMenu="05">
        <div className="my-5 mx-auto">
          <div className="content p-6 sm:p-10 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 mb-1">Role Management</h1>
                  <div className="text-gray-500 text-sm">
                    <a href="/admin/dashboard" className="hover:underline">Dashboard</a> / <a href="/admin/roles" className="hover:underline">Roles</a> / Add
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Role Name</label>
                    <input
                      name="role_name"
                      value={formData.role_name}
                      onChange={handleChange}
                      required
                      className="w-full border px-3 py-2 rounded"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border px-3 py-2 rounded"
                      placeholder="Enter role description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Permissions</label>
                    {Object.entries(grouped).map(([typeName, perms]) => (
                      <div key={typeName} className="mb-4 border rounded p-4 bg-gray-50">
                      
                        <label className="flex items-center space-x-2 font-medium text-gray-800 mb-2 capitalize">
                          <input
                            type="checkbox"
                            checked={selectedTypes[typeName] || false}
                            onChange={() => toggleType(typeName)}
                          />
                          <span>{typeName}</span>
                        </label>

                        
                        {selectedTypes[typeName] && (
                          <div className="pl-4 space-y-2">
                            {perms.map((perm) => (
                              <label key={perm.permission_id} className="flex items-center space-x-2 text-sm">
                                <input
                                  type="radio"
                                  name={`perm-${typeName}`}
                                  checked={!!selectedPermissions[perm.permission_id]}
                                  onChange={() => handlePermissionSelect(perm)}
                                />
                                <span>{perm.permission_name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/roles')}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Create Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AddRole;
