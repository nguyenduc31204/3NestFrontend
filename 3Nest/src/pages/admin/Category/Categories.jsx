
import React, { useEffect, useState } from 'react'
import {
    LuCoins,
    LuWalletMinimal,
    LuPersonStanding,
    LuChevronsLeft,
    LuChevronLeft,
    LuChevronRight,
    LuChevronsRight,
    LuArrowDownToLine,
    LuArrowUpNarrowWide,
    LuRefreshCcw
} from "react-icons/lu"

import Header from '../../../components/layouts/Header'
import DasboardLayout from '../../../components/layouts/DashboardLayout'
import { API_PATHS, BASE_URL } from '../../../utils/apiPath'
import { useNavigate } from 'react-router-dom'
import CategoryModal from './CategoryModal';
import axiosInstance from '../../../utils/axiosInstance';

const Categories = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role');
  const [activeRole, setActiveRole] = useState(role || 'admin');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProductsByTypeAndRole();
  }, []);

  const loadProductsByTypeAndRole = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/categories/get-categories`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      const result = await response.json();
      setProducts(result.data);
      setLoading(false);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Failed to load products: ${err.message}`);
      setLoading(false);
    }
  };

  const handleDelete = async (category_id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axiosInstance.delete(`/categories/delete-category?category_id=${category_id}`);
      loadProductsByTypeAndRole();
      
    } catch (err) {
      console.error("Delete error", err);
      alert("Error deleting category");
    }
    
  };

  const handleRefresh = () => {
    loadProductsByTypeAndRole();
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedData = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>

        <div className='my-5 mx-auto'>
          <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
              <div className="page-title">
                <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Category Management</h1>
                <div className="breadcrumb text-gray-500 text-sm hover:text-slate-500">
                  <a href="#" className='text-gray-500'>Dashboard</a> / Category
                </div>
              </div>
              <div className="action-buttons mb-2">
                <button
                  onClick={() => { setEditingCategory(null); setModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i> Add new category
                </button>
              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
                <div className="tools flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors" title="Export Excel">
                    <LuArrowDownToLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Filter">
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Refresh" onClick={handleRefresh}>
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
                  <div className="p-8 text-center text-blue-600">Loading products...</div>
                ) : (
                  <div className="table-responsive overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((category, index) => (
                          <tr key={category.category_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{category.category_name || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{category.type_name || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{category.description || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 space-x-2">
                              <button onClick={() => { setEditingCategory(category); setModalOpen(true); }} className='text-blue-600'>Edit</button>
                              <button onClick={() => handleDelete(category.category_id)} className='text-red-600'>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end px-6 py-3 border-t bg-gray-50">
                      <div className="space-x-2">
                        <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
                        <span>Page {currentPage}</span>
                        <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))} disabled={currentPage >= totalPages}>Next</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      <CategoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} category={editingCategory} onSubmitSuccess={loadProductsByTypeAndRole} />
    </div>
  );
};

export default Categories;
