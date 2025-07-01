import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { FiEdit, FiTrash } from 'react-icons/fi';
import DasboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import { hasPermission } from '../../../utils/permissionUtils';
import {
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw
} from "react-icons/lu";

const TypeDetail = () => {
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/types/get-types');
      setTypes(res.data?.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Cannot load type list');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this type?')) return;
    try {
      await axiosInstance.delete(`/types/delete-type?type_id=${id}`);
      fetchTypes();
    } catch (err) {
      alert('Delete failed!');
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (hasPermission(parsedUser, 'type:view')) {
        fetchTypes();
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const totalPages = Math.ceil(types.length / itemsPerPage);
  const paginatedData = types.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  if (!user) return <div className="p-8 text-center">Initializing…</div>;

  if (!hasPermission(user, 'type:view')) {
    return <div className="p-8 text-center text-red-600">Bạn không có quyền truy cập trang này.</div>;
  }

  

  return (
  <div className="my-5 mx-auto">
    <div className="content p-6 sm:p-10">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8">
        <div className="page-title">
          <h1 className='text-2xl font-bold text-gray-800 mb-1'>Type Management</h1>
          {/* <div className="breadcrumb text-gray-500 text-sm">
            <a href="#" className='hover:underline'>Dashboard</a> / Type
          </div> */}
        </div>
        <div className="action-buttons">
          {hasPermission(user, 'role:manage') && (
            <button
              onClick={() => navigate('/types/add')}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              + Add Type
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        {/* Tools */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Types</h2>
          <div className="tools flex space-x-2">
            {/* <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors" title="Export Excel">
              <LuArrowDownToLine className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Filter">
              <LuArrowUpNarrowWide className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Refresh" onClick={fetchTypes}>
              <LuRefreshCcw className="w-5 h-5" />
            </button> */}
          </div>
        </div>

        {/* Table Body */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading types...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Type Name</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  {hasPermission(user, 'role:manage') && (
                    <th className="px-6 py-3 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((type, index) => (
                  <tr key={type.type_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4">{type.type_name}</td>
                    <td className="px-6 py-4">{type.type_description}</td>
                    {hasPermission(user, 'role:manage') && (
                      <td className="px-6 py-4 space-x-8">
                        <button
                          title="Edit"
                          onClick={() => navigate(`/types/edit/${type.type_id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(type.type_id)}
                          className="text-red-600 hover:underline"
                        >
                          <FiTrash className="w-5 h-5" />
                        </button>
                      </td>

                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {/* <div className="flex justify-end px-6 py-3 border-t bg-gray-50">
              <div className="space-x-2 text-sm">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span>Page {currentPage}</span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default TypeDetail;
