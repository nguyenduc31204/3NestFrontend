import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import DasboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
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
    fetchTypes();
  }, []);

  const totalPages = Math.ceil(types.length / itemsPerPage);
  const paginatedData = types.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      
        <div className="my-5 mx-auto">
          <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
              <div className="page-title">
                <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Type Management</h1>
                <div className="breadcrumb text-gray-500 text-sm hover:text-slate-500">
                  <a href="#" className='text-gray-500'>Dashboard</a> / Type
                </div>
              </div>
              <div className="action-buttons mb-2">
                <button
                  onClick={() => navigate('/types/add')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  + Add Type
                </button>
              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Types</h2>
                <div className="tools flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors" title="Export Excel">
                    <LuArrowDownToLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Filter">
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Refresh" onClick={fetchTypes}>
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

                {loading ? (
                  <div className="p-8 text-center text-blue-600">Loading types...</div>
                ) : (
                  <div className="table-responsive overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((type, index) => (
                          <tr key={type.type_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{type.type_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{type.type_description}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 space-x-2">
                              <button
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                                onClick={() => navigate(`/types/edit/${type.type_id}`)}
                              >
                                Update
                              </button>
                              <button
                                className="bg-red-600 text-white px-3 py-1 rounded"
                                onClick={() => handleDelete(type.type_id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end px-6 py-3 border-t bg-gray-50">
                      <div className="space-x-2">
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
   
    </div>
  );
};

export default TypeDetail;
