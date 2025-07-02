import React, { useEffect, useState } from 'react'
import { FiEdit, FiTrash } from 'react-icons/fi';
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
import { hasPermission } from '../../../utils/permissionUtils';


const Categories = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // const loadProductsByTypeAndRole = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null); // Reset error state
  //     const response = await axiosInstance.get("/categories/get-categories", {
  //       headers: {
  //         'ngrok-skip-browser-warning': 'true'
  //       }
  //     });
      
  //     if (response.data && response.data.data) {
  //       setProducts(response.data.data);
  //     } else {
  //       throw new Error('Invalid response format');
  //     }
  //   } catch (err) {
  //     console.error("API Error:", err);
  //     setError(`Failed to load categories: ${err.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    //  Load user từ localStorage và gọi API nếu hợp lệ
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadCategories(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);
  const loadCategories = async (currentUser = user) => {
    if (!currentUser || !hasPermission(currentUser, 'category:view')) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/categories/get-categories', {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category_id) => {
    //  Kiểm tra quyền 'category:delete' trước khi xoá
    if (!hasPermission(user, 'category:delete')) return;
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axiosInstance.delete(`/categories/delete-category?category_id=${category_id}`);
      await loadCategories();
    } catch (err) {
      console.error('Delete error', err);
      alert('Error deleting category');
    }
  };

  const handleRefresh = () => {
     loadCategories();
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleUpdateSuccess = async () => {
    await loadCategories();
    handleModalClose();
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedData = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!user) return <div className="p-8 text-center">Initializing…</div>;
  //  Kiểm tra nếu không có quyền 'category:view' thì không hiển thị nội dung
  if (!hasPermission(user, 'category:view')) {
    return <div className="p-8 text-center text-red-600">Bạn không có quyền truy cập trang này.</div>;
  }
  return (
  <div>
    <div className="my-5 mx-auto">
      <div className="content p-20">
        <div className="page-header flex justify-between items-center mb-10">
          <div className="page-title">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Category Management</h1>
            
          </div>
          <div className="action-buttons mb-2">
            {hasPermission(user, 'category:manage') && (
              <button
                onClick={() => { setEditingCategory(null); setModalOpen(true); }}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <i className="fas fa-plus mr-2"></i> Add Category
              </button>
            )}
          </div>
        </div>

        <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-200">
          <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Categories Table</h2>
            <div className="tools flex space-x-2">
              {/* <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors" title="Export Excel">
                <LuArrowDownToLine className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Filter">
                <LuArrowUpNarrowWide className="w-5 h-5" />
              </button> */}
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" title="Refresh" onClick={handleRefresh}>
                <LuRefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading categories...</div>
            ) : (
              <div className="table-responsive overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">#</th>
                      <th className="px-6 py-3 text-left font-semibold">Category Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Type Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Description</th>
                      {(hasPermission(user, 'category:manage') || hasPermission(user, 'category:delete')) && (
                        <th className="px-6 py-3 text-left font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedData.map((category, index) => (
                      <tr key={category.category_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-6 py-4">{category.category_name || '-'}</td>
                        <td className="px-6 py-4">{category.type_name || '-'}</td>
                        <td className="px-6 py-4">{category.description || '-'}</td>
                        {(hasPermission(user, 'category:manage') || hasPermission(user, 'category:delete')) && (
                          <td className="px-6 py-4 space-x-8 flex items-center">
                            {hasPermission(user, 'category:manage') && (
                              <button
                                onClick={() => { setEditingCategory(category); setModalOpen(true); }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FiEdit className="w-5 h-5" />
                              </button>
                            )}
                            {hasPermission(user, 'category:delete') && (
                              <button
                                onClick={() => handleDelete(category.category_id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FiTrash className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* <div className="flex justify-end px-6 py-3 border-t bg-gray-50">
                  <div className="space-x-2">
                    <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
                    <span>Page {currentPage}</span>
                    <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))} disabled={currentPage >= totalPages}>Next</button>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <CategoryModal 
      isOpen={modalOpen} 
      onClose={handleModalClose}
      onSubmitSuccess={handleUpdateSuccess}
      category={editingCategory} 
    />
  </div>
);
};

export default Categories;
