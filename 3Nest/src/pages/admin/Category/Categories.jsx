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

const Categories = () => {
  const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role');
    const [activeRole, setActiveRole] = useState(role || 'admin');

    useEffect(() => {
        loadProductsByTypeAndRole();
    }, []);

    const loadProductsByTypeAndRole = async () => {
        try {
            setLoading(true); 
            const response = await fetch(`${BASE_URL}/categories/get-categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'custom-agent/1.0',
                    'ngrok-skip-browser-warning': 'true'
                },
                // mode: 'cors'
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

    const handleRefresh = () => {
        loadProductsByTypeAndRole();
    };


 return (
        <div>
            <Header />
            <DasboardLayout activeMenu="03">
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
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                                    <i className="fas fa-plus mr-2"></i> Add new category
                                </button>
                            </div>
                        </div>



                        <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
                            <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
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
                                            Loading products...
                                        </div>
                                    </div>
                                )}

                                <div className="table-responsive overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.map((category, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{category.category_name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{category.type_name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{category.description || '-'}</td>
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
                                                Showing <span className="font-medium">1</span> to <span className="font-medium">{products.length}</span> of{' '}
                                                <span className="font-medium">{products.length}</span> results
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

export default Categories
