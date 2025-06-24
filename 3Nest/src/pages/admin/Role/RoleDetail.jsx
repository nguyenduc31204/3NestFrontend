import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [roleRes, permRes] = await Promise.all([
          fetch(`${BASE_URL}/roles/get-role?role_id=${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }),
          fetch(`${BASE_URL}/permissions/get-permissions`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }),
        ]);

        const roleData = await roleRes.json();
        const permData = await permRes.json();
        console.log("Role Response:", roleRes.status, roleData);
        console.log("Permission Response:", permRes.status, permData);



        if (roleData.status_code === 200 && permData.status_code === 200) {
          setRole(roleData.data);
          setPermissions(permData.data);
        } else {
          setError('Failed to fetch role details');
        }
      } catch {
        setError('Error loading data');
      }
    };

    fetchDetail();
  }, [id]);

  const getPermissionNames = () => {
  if (!role || !Array.isArray(role.permissions)) return [];

  return role.permissions.map((perm) => {
    const fullPerm = permissions.find(p => p.permission_id === perm.permission_id);
    const type = fullPerm?.permission_type_name || 'unknown';
    return `${perm.permission_name} (${type})`;
  });
};


console.log("role detail:", role);
console.log("all permissions:", permissions);


  return (
    <>
     
        <div className="my-5 mx-auto max-w-2xl">
          <h1 className="text-xl font-semibold mb-4">Role Detail</h1>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {!role ? (
            <div>Loading...</div>
          ) : (
            <div className="bg-white shadow rounded p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold">Role Name</label>
                <div className="text-gray-700">{role.role_name}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold">Description</label>
                <div className="text-gray-700">{role.role_description}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold">Permissions</label>
                <ul className="list-disc list-inside text-gray-700">
                    {getPermissionNames().length === 0 ? (
                        <li className="text-gray-400 italic">No permissions assigned</li>
                    ) : (
                        getPermissionNames().map((perm, idx) => (
                        <li key={idx}>{perm}</li>
                        ))
                    )}
                </ul>

              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/roles')}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
    
    </>
  );
};

export default RoleDetail;
