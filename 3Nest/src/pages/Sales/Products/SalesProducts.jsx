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
import { decodeToken } from '../../../utils/help'

const Products = () => {
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState(1);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem("access_token");
    const decode = decodeToken(token);
    const role = decode?.role || 'sales'; 
    const [activeRole, setActiveRole] = useState('sales'); 

    useEffect(() => {
        const fetchTypes = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${BASE_URL}/types/get-types`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                });

                const contentType = response.headers.get('content-type');
                const responseBody = await response.text();

                if (contentType && contentType.includes('text/html')) {
                    throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
                }

                const result = JSON.parse(responseBody);

                if (!response.ok) {
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                }

                if (!result || typeof result !== 'object') {
                    throw new Error('Invalid API response structure');
                }

                if (result.status_code === 200) {
                    if (Array.isArray(result.data)) {
                        setTypes(result.data);
                        if (result.data.length > 0) {
                            setSelectedTypeId(result.data[0].type_id);
                        }
                    } else {
                        throw new Error('Data field is not an array');
                    }
                } else {
                    throw new Error(result.message || "API request failed");
                }
            } catch (err) {
                console.error("API Error:", err);
                setError(err.message);

                if (err.message.includes('401')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();
    }, [BASE_URL, navigate]);

    useEffect(() => {
        loadProductsByTypeAndRole(); 
    }, []);

    const loadProductsByTypeAndRole = async () => {
            try {
                const url = `${BASE_URL}/products/get-products-by-role`;
                console.log("Fetching products from:", url);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                const result = await response.json();
                console.log('Products API response:', result);

                if (result.status_code === 200 && Array.isArray(result.data)) {
                    setProducts(result.data);
                } else {
                    throw new Error(result.mess || "Invalid product data format");
                }
            } catch (err) {
                console.error("API Error:", err);
                setError(`Failed to load products: ${err.message}`);
            }
        };


    console.log("product", selectedTypeId)

    const handleTypeChange = (e) => {
        setSelectedTypeId(parseInt(e.target.value));
    };

    const handleRefresh = () => {
        if (selectedTypeId) {
            loadProductsByTypeAndRole('sales', selectedTypeId);
        }
    };

    return (
        <div>
        <Header />
        <DasboardLayout activeMenu="02">
            <div className="my-4 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="content py-4 sm:py-6 lg:py-8">
                <div className="page-header flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 lg:mb-10 gap-4">
                <div className="page-title">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">Sales Products</h1>
                    <div className="breadcrumb text-xs sm:text-sm text-gray-500 hover:text-slate-500">
                    <a href="#" className="text-gray-500">Dashboard</a> / Sales Products
                    </div>
                </div>
                {/* Đã xóa nút Add new product */}
                </div>

                <div className="stats-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8 lg:mb-10">
                <div className="stat-card flex-1 rounded-md p-4 sm:p-5 m-0 sm:m-2 shadow-md bg-white">
                    <div className="stat-icon bg-blue-100 text-blue-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3">
                    <LuCoins className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="stat-value text-xl sm:text-2xl font-bold text-gray-800">{products.length}</div>
                    <div className="stat-label text-xs sm:text-sm text-gray-500">Total Products</div>
                </div>

                <div className="stat-card flex-1 rounded-md p-4 sm:p-5 m-0 sm:m-2 shadow-md bg-white">
                    <div className="stat-icon bg-green-100 text-green-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3">
                    <LuWalletMinimal className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="stat-value text-xl sm:text-2xl font-bold text-gray-800">
                    {products.filter(p => p.status === true).length}
                    </div>
                    <div className="stat-label text-xs sm:text-sm text-gray-500">Active Products</div>
                </div>

                <div className="stat-card flex-1 rounded-md p-4 sm:p-5 m-0 sm:m-2 shadow-md bg-white">
                    <div className="stat-icon bg-yellow-100 text-yellow-600 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3">
                    <LuPersonStanding className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="stat-value text-xl sm:text-2xl font-bold text-gray-800">
                    {products.filter(p => p.status === false).length}
                    </div>
                    <div className="stat-label text-xs sm:text-sm text-gray-500">Inactive Products</div>
                </div>
                </div>

                <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6">
                <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-0">Sales Products</h2>
                    <div className="tools flex space-x-1 sm:space-x-2">
                    <button
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Export Excel"
                    >
                        <LuArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Filter"
                    >
                        <LuArrowUpNarrowWide className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Refresh"
                        onClick={handleRefresh}
                    >
                        <LuRefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    </div>
                </div>

                <div className="p-3 sm:p-4 border-b border-gray-200">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Product Type</label>
                    <select
                    value={selectedTypeId}
                    onChange={handleTypeChange}
                    className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    {types.map(type => (
                        <option key={type.type_id} value={type.type_id}>
                        {type.type_name}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="card-body p-0">
                    {error && (
                    <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-400">
                        <div className="flex">
                        <div className="ml-2 sm:ml-3">
                            <p className="text-xs sm:text-sm text-red-700">{error}</p>
                        </div>
                        </div>
                    </div>
                    )}

                    {loading && (
                    <div className="p-4 sm:p-6 lg:p-8 text-center">
                        <div className="inline-flex items-center px-3 sm:px-4 py-2 font-semibold leading-6 text-xs sm:text-sm shadow rounded-md text-blue-500 bg-white">
                        <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category Name</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type Name</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">SKU/Part Number</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Description</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Max Discount</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Max Discount Price</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {!loading && products.length === 0 ? (
                            <tr>
                            <td colSpan="9" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-gray-500 text-xs sm:text-sm">
                                No products found for the selected criteria
                            </td>
                            </tr>
                        ) : (
                            products.map((product, index) => (
                            <tr key={product.product_id || index} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">{product.product_name || '-'}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{product.category_name || '-'}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                                {types.find(t => t.type_id === selectedTypeId)?.type_name || '-'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{product.sku_partnumber || '-'}</td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-[100px] sm:max-w-xs truncate hidden lg:table-cell" title={product.desciption}>
                                {product.description || '-'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                                {product.price ? `${parseFloat(product.price).toLocaleString()}` : '-'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                                {product.maximum_discount ? `${product.maximum_discount}%` : '-'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                                {product.maximum_discount_price ? `${parseFloat(product.maximum_discount_price).toLocaleString()}` : '-'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                                    product.status === true 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                    {product.status === true ? 'Active' : 'Inactive'}
                                </span>
                                </td>
                            </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </DasboardLayout>
        </div>
    )
}

export default Products