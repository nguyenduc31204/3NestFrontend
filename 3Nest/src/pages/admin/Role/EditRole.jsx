import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ role_name: '', description: '' });
  const [permissions, setPermissions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [error, setError] = useState(null);

  // Load permissions & role
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const resPerm = await fetch(`${BASE_URL}/permissions/get-permissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const permResult = await resPerm.json();
        if (permResult.status_code !== 200) throw new Error('Permission load failed');
        setPermissions(permResult.data);

        const resRole = await fetch(`${BASE_URL}/roles/get-role?request_id=${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        const roleResult = await resRole.json();
        if (roleResult.status_code !== 200) throw new Error('Role load failed');

        const { role_name, description, permissions: rolePermIds } = roleResult.data;
        setFormData({ role_name, description });

        const selected = {};
        const types = {};

        rolePermIds.forEach(pid => {
          const permObj = permResult.data.find(p => p.permission_id === pid);
          if (permObj) {
            selected[pid] = { type: permObj.permission_type_name };
            types[permObj.permission_type_name] = true;
          }
        });

        setSelectedPermissions(selected);
        setSelectedTypes(types);
      } catch (err) {
        setError('Failed to load role or permissions');
      }
    };

    fetchAll();
  }, [id]);

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
      Object.entries(updated).forEach(([permId]) => {
        const permObj = permissions.find(p => p.permission_id === Number(permId));
        if (permObj && permObj.permission_type_name === typeName) {
          delete updated[permId];
        }
      });
      setSelectedPermissions(updated);
    }
  };

  const handlePermissionSelect = (perm) => {
    setSelectedPermissions((prev) => {
      const updated = Object.entries(prev)
        .filter(([pid]) => {
          const permObj = permissions.find(p => p.permission_id === Number(pid));
          return permObj?.permission_type_name !== perm.permission_type_name;
        })
        .reduce((acc, [pid, val]) => {
          acc[pid] = val;
          return acc;
        }, {});
      updated[perm.permission_id] = { type: perm.permission_type_name };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const selectedPermissionIds = Object.keys(selectedPermissions).map(Number);
    const payload = {
      role_id: Number(id),
      role_name: formData.role_name,
      description: formData.description,
      permissions: selectedPermissionIds,
    };

    try {
      const res = await fetch(`${BASE_URL}/roles/update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to update role');
        return;
      }

      navigate('/roles');
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const type = perm.permission_type_name;
    if (!acc[type]) acc[type] = [];
    acc[type].push(perm);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <DashboardLayout activeMenu="05">
        <div className="my-5 mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold mb-4">Edit Role</h1>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium">Role Name</label>
              <input
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              {Object.entries(groupedPermissions).map(([typeName, perms]) => (
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
                onClick={() => navigate('/roles')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </>
  );
};

export default EditRole;
