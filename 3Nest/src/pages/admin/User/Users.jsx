import React, { useEffect, useState } from 'react'

import {
    LuCoins,
    LuWalletMinimal,
    LuPersonStanding,
    LuUserCheck,
    LuVoicemail,
    LuChevronsLeft,
    LuChevronLeft,
    LuChevronRight,
    LuChevronsRight,
    LuArrowDownToLine,
    LuArrowUpNarrowWide,
    LuShieldAlert,
    LuRefreshCcw,
    LuSettings,
    LuTrash2
} from "react-icons/lu"
import Header from '../../../components/layouts/Header'
import DasboardLayout from '../../../components/layouts/DashboardLayout'
import { API_PATHS, BASE_URL } from '../../../utils/apiPath'
import { useNavigate } from 'react-router-dom'

const Users = () => {
  const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role');
    const [activeRole, setActiveRole] = useState(role || 'admin');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true); 
            const response = await fetch(`${BASE_URL}/users/get-users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                mode: 'cors'
            });
            const result = await response.json();
            setUsers(result.data);
            setLoading(false); 
        } catch (err) {
            console.error("API Error:", err);
            setError(`Failed to load users: ${err.message}`);
            setLoading(false); 
        }
    };

    const handleRefresh = () => {
        loadUsers();
    };

    const handleEditUser = (userId) => {
        navigate(`/users/edit/${userId}`);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`${BASE_URL}/users/delete-user/?user_id=${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'ngrok-skip-browser-warning': 'true',

                    }
                });
                if (response.ok) {
                    loadUsers(); // Refresh the list after deletion
                }
            } catch (err) {
                console.error("Delete Error:", err);
                setError(`Failed to delete user: ${err.message}`);
            }
        }
    };

 return (
        <div>
            <Header />
            <DasboardLayout activeMenu="05">
                <div className='my-5 mx-auto'>
                    <div className="content p-20">
                        <div className="page-header flex justify-between items-center mb-10">
                            <div className="page-title">
                                <h1 className='text-2xl font-semibold text-gray-800 mb-2'>User Management</h1>
                                <div className="breadcrumb text-gray-500 text-sm hover:text-slate-500">
                                    <a href="#" className='text-gray-500'>Dashboard</a> / Users
                                </div>
                            </div>
                            <div className="action-buttons mb-2">
                                <button 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                    onClick={() => navigate('/users/add')}
                                >
                                    <i className="fas fa-plus mr-2"></i> Add new user
                                </button>
                            </div>
                        </div>

                        <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
                            <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Users</h2>
                                <div className="tools flex space-x-2">
                                    <button 
                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                                        title="Export Excel"
                                    >
                                        <LuArrowDownToLine className="w-5 h-5" />
                                    </button>
                                    <button 
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                                        title="Filter"
                                    >
                                        <LuArrowUpNarrowWide className="w-5 h-5" />
                                    </button>
                                    <button 
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                                        title="Refresh"
                                        onClick={handleRefresh}
                                    >
                                        <LuRefreshCcw className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="card-body p-0">
                            {error && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-400">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                                {loading && (
                                    <div className="p-8 text-center">
                                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-white">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading users...
                                        </div>
                                    </div>
                                )}

                                <div className="table-responsive overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <LuUserCheck className="h-10 w-10 rounded-full text-gray-400" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-sm text-gray-500">{user.user_name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <LuVoicemail className="flex-shrink-0 mr-2 text-gray-400" />
                                                            <div className="text-sm text-gray-900">{user.user_email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <LuShieldAlert className="flex-shrink-0 mr-2 text-gray-400" />
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 
                                                                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                                                                  'bg-gray-100 text-gray-800'}`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex space-x-2">
                                                            <button 
                                                                onClick={() => handleEditUser(user.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit"
                                                            >
                                                                <LuSettings className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteUser(user.user_id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete"
                                                            >
                                                                <LuTrash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="pagination flex items-center justify-between px-4 py-3 border-t border-gray-200">
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of{' '}
                                                <span className="font-medium">{users.length}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                    <span className="sr-only">First</span>
                                                    <LuChevronsLeft className="w-5 h-5" />
                                                </button>
                                                <button className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                    <span className="sr-only">Previous</span>
                                                    <LuChevronLeft className="w-5 h-5" />
                                                </button>
                                                
                                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">1</button>
                                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">2</button>
                                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">3</button>
                                                
                                                <button className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                    <span className="sr-only">Next</span>
                                                    <LuChevronRight className="w-5 h-5" />
                                                </button>
                                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                                    <span className="sr-only">Last</span>
                                                    <LuChevronsRight className="w-5 h-5" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DasboardLayout>
        </div>
    )
}

export default Users