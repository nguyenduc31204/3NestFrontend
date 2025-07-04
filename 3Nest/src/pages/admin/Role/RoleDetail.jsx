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
        const [roleRes] = await Promise.all([
          fetch(`${BASE_URL}/roles/get-role?request_id=${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }),
          // fetch(`${BASE_URL}/permissions/get-permissions`, {
          //   headers: {
          //     Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          //     'ngrok-skip-browser-warning': 'true',
          //   },
          // }),
        ]);

        const roleData = await roleRes.json();
        // const permData = await permRes.json();
        console.log("Role Response:", roleData);
        // console.log("Permission Response:", permData);



        
          setRole(roleData.data);
          setPermissions(roleData.data.permissions);
        
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
    <div className="my-5 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      {/* Tiêu đề trang */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Role Detail</h1>

      {/* Lỗi nếu có */}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Nội dung */}
      {!role ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="bg-gray-100 border border-gray-300 shadow-md rounded-lg p-6 space-y-6">
          {/* Role Name */}
          <div>
            <label className="block text-xl font-bold text-gray-700 mb-1">Role Name</label>
            <div className="text-base font-medium text-gray-900 mt-1">{role.role_name}</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xl font-bold text-gray-700 mb-1">Description</label>
            <div className="text-base text-gray-900 mt-1">{role.description}</div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-xl font-bold text-gray-700 mb-1">Permissions</label>
            <ul className="list-disc list-inside mt-1 text-gray-900">
              {getPermissionNames().length === 0 ? (
                <li className="text-gray-500 italic">No permissions assigned</li>
              ) : (
                getPermissionNames().map((perm, idx) => (
                  <li key={idx}>{perm}</li>
                ))
              )}
            </ul>
          </div>

          {/* Back button */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/roles')}
              className="px-5 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
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
