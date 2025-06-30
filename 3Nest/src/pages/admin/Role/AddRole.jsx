import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const AddRole = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ role_name: '', role_description: '' });
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
      console.log(res);
      const data = await res.json(); // 👈 Lấy JSON từ response

      console.log("Create role response status:", res.status);
      console.log("Create role response body:", data);

      

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create role');
        return;
      }

      navigate('/roles');
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
    <div className="my-5 mx-auto">
      <div className="content p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Title + Back on top-left */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#C71585]">Role Management</h1>
            <div className="text-sm mt-1">
              <a href="/roles" className="text-fuchsia-700 hover:underline">← Back</a>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white shadow-md border border-fuchsia-200 rounded-lg p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium mb-1 text-fuchsia-800">Role Name</label>
                <input
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-fuchsia-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  placeholder="Enter role name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1 text-fuchsia-800">Description</label>
                <textarea
                  name="role_description"
                  value={formData.role_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-fuchsia-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  placeholder="Enter role description"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium mb-2 text-fuchsia-800">Permissions</label>
                {Object.entries(grouped).map(([typeName, perms]) => (
                  <div key={typeName} className="mb-4 border border-fuchsia-200 rounded p-4 bg-pink-50">
                    <label className="flex items-center space-x-2 font-medium text-fuchsia-900 mb-2 capitalize">
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
                          <label key={perm.permission_id} className="flex items-center space-x-2 text-sm text-gray-700">
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

              {/* Buttons */}
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
                  className="px-4 py-2 bg-[#C71585] text-white rounded hover:bg-pink-800 transition"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </>
);

};

export default AddRole;
