import React, { useEffect, useState } from 'react';
import {
  LuUserCheck,
  LuVoicemail,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw,
  LuShieldAlert,
  LuSettings,
  LuTrash2
} from 'react-icons/lu';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [activeRole, setActiveRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/users/get-users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const result = await res.json();
      setUsers(result.data || []);
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => loadUsers();
  const handleRoleChange = (role) => setActiveRole(role);

  // Map plural to possible backend values
  const roleMap = {
    sales: ['sales', 'sale'],
    channel: ['channel', 'channel'],
  };

  // Filter users by role, or show all
  const filteredUsers =
    activeRole === 'all'
      ? users
      : users.filter(u => {
          const r = u.role.toLowerCase();
          if (roleMap[activeRole]) {
            return roleMap[activeRole].includes(r);
          }
          return r === activeRole;
        });

  const handleEditUser = (userId) => navigate(`/users/edit/${userId}`);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(
        `${BASE_URL}/users/delete-user/?user_id=${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      if (res.ok) loadUsers();
    } catch (err) {
      console.error('Delete Error:', err);
      setError(`Failed to delete user: ${err.message}`);
    }
  };

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="05">
        <div className="my-5 mx-auto">
          <div className="content p-20">
            {/* Page Header */}
            <div className="page-header flex justify-between items-center mb-10">
              <div className="page-title">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">User Management</h1>
                
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                onClick={() => navigate('/users/add')}
              >
                + Add new user
              </button>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Tools Header */}
              <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Users</h2>
                <div className="tools flex space-x-2">
                  <button title="Export Excel" className="p-2 hover:bg-gray-100 rounded">
                    <LuArrowDownToLine className="w-5 h-5 text-gray-600 hover:text-green-600" />
                  </button>
                  <button title="Filter" className="p-2 hover:bg-gray-100 rounded">
                    <LuArrowUpNarrowWide className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  </button>
                  <button title="Refresh" className="p-2 hover:bg-gray-100 rounded" onClick={handleRefresh}>
                    <LuRefreshCcw className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Role Filter */}
              <div className="p-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <div className="flex space-x-2">
                    <RoleButton current={activeRole} value="all" onClick={() => handleRoleChange('all')}>All</RoleButton>
                    <RoleButton current={activeRole} value="admin" onClick={() => handleRoleChange('admin')}>Admin</RoleButton>
                    <RoleButton current={activeRole} value="manager" onClick={() => handleRoleChange('manager')}>Manager</RoleButton>
                    <RoleButton current={activeRole} value="sales" onClick={() => handleRoleChange('sales')}>Sales</RoleButton>
                    <RoleButton current={activeRole} value="channel" onClick={() => handleRoleChange('channel')}>Channels</RoleButton>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="card-body p-0">
                {error && <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>}
                {loading ? (
                  <div className="p-8 text-center text-blue-600">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <Th>#</Th>
                          <Th>User</Th>
                          <Th>Email</Th>
                          <Th>Role</Th>
                          <Th>Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user, index) => (
                          <tr
                            key={user.user_id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/users/detail/${user.user_id}`)}
                          >
                            <Td>{index + 1}</Td>
                            <Td>
                              <div className="flex items-center">
                                <LuUserCheck className="h-10 w-10 rounded-full text-gray-400" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.user_name}</div>
                                </div>
                              </div>
                            </Td>
                            <Td>
                              <div className="flex items-center">
                                <LuVoicemail className="mr-2 text-gray-400" />
                                <span className="text-sm text-gray-900">{user.user_email}</span>
                              </div>
                            </Td>
                            <Td>
                              <div className="flex items-center">
                                <LuShieldAlert className="mr-2 text-gray-400" />
                                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                                  user.role === 'admin' ? 'bg-green-100 text-green-800' :
                                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                  user.role === 'sales' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>{user.role}</span>
                              </div>
                            </Td>
                            <Td>
                              <div className="flex space-x-2">
                                <button
                                  onClick={e => { e.stopPropagation(); handleEditUser(user.user_id); }}
                                  title="Edit"
                                >
                                  <LuSettings className="w-5 h-5 text-blue-600 hover:text-blue-900" />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDeleteUser(user.user_id); }}
                                  title="Delete"
                                >
                                  <LuTrash2 className="w-5 h-5 text-red-600 hover:text-red-900" />
                                </button>
                              </div>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination (static) */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <p className="text-sm text-gray-700">Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{filteredUsers.length}</span> results</p>
                  <div className="inline-flex rounded-md shadow-sm -space-x-px">
                    <button className="px-2 py-2 rounded-l-md border bg-white text-gray-500 hover:bg-gray-50"><LuChevronsLeft className="w-5 h-5" /></button>
                    <button className="px-2 py-2 border bg-white text-gray-500 hover:bg-gray-50"><LuChevronLeft className="w-5 h-5" /></button>
                    <button className="px-4 py-2 border bg-blue-50 text-blue-600">1</button>
                    <button className="px-4 py-2 border bg-white text-gray-700 hover:bg-gray-50">2</button>
                    <button className="px-2 py-2 border bg-white text-gray-500 hover:bg-gray-50"><LuChevronRight className="w-5 h-5" /></button>
                    <button className="px-2 py-2 rounded-r-md border bg-white text-gray-500 hover:bg-gray-50"><LuChevronsRight className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

const RoleButton = ({ current, value, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium rounded-md ${current === value ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Th = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
);

const Td = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{children}</td>
);

export default Users;
