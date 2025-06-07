import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

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
import Header from '../../../components/layouts/Header';
import DasboardLayout from '../../../components/layouts/DashboardLayout';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

//   const fetchDashboardData = async () => {
//     if(loading) return;

//     setLoading(true);

//     try{
//       const response = await axiosInstance.get(
//         `${API_PATHS}`
//       )

//       if(response.data) {
//         setDashboardData(response.data)
//       }
//       console.log(response.data)
//     } catch (error) {
//       console.log(" co loi xay ra", error)
//     } finally {
//       setLoading(false);
//     }
//   }

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);
  return (
    <div>
      <Header />
      <DasboardLayout activeMenu="Dashboard">
        <div className='my-5 mx-auto'>
            <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
                <div class="page-title">
                    <h1 className='text-2xl font-semibold bg-#181c32 mb-2'>Dashboard Management</h1>
                    <div className="breadcrumb text-gray-500 text-sm hover: text-slate-500">
                        <a href="#" className='text-gray-500 '>Dashboard</a> / Product
                    </div>
                </div>
                <div className="action-buttons mb-2">
                    <button class="btn btn-primary" onclick="openModal()">
                        <i class="fas fa-plus"></i> Add new product
                    </button>
                </div>
            </div>

            <div className="stats-row flex flex-wrap gap-4 mb-10">
            <div className="stat-card flex-1 min-w-[200px] rounded-md p-5 m-2 shadow-md bg-white">
                <div className="stat-icon bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <LuCoins className="w-6 h-6" />
                </div>
                <div className="stat-value text-2xl font-bold text-gray-800">254</div>
                <div className="stat-label text-gray-500">Total Products</div>
            </div>

            <div className="stat-card flex-1 min-w-[200px] rounded-md p-5 m-2 shadow-md bg-white">
                <div className="stat-icon bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <LuWalletMinimal className="w-6 h-6" />
                </div>
                <div className="stat-value text-2xl font-bold text-gray-800">180</div>
                <div className="stat-label text-gray-500">On Business</div>
            </div>

            <div className="stat-card flex-1 min-w-[200px] rounded-md p-5 m-2 shadow-md bg-white">
                <div className="stat-icon bg-yellow-100 text-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <LuPersonStanding className="w-6 h-6" />
                </div>
                <div className="stat-value text-2xl font-bold text-gray-800">15</div>
                <div className="stat-label text-gray-500">Almost Out of Stock</div>
            </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Products And Services</h2>
                <div className="tools flex space-x-2">
                <button 
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Xuất Excel"
                >
                    <LuArrowDownToLine className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Lọc"
                >
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Làm mới"
                >
                    <LuRefreshCcw className="w-5 h-5" />
                </button>
                </div>
            </div>

            <div class="product-role">
                <button class="button active" value="admin">Admin</button>
                <button class="button" value="sales">Sales</button>
                <button class="button" value="channels">Channels</button>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU/Part Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Discount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Discount Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" id="product-table-body">
                    </tbody>
                </table>
                </div>

                <div className="pagination flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
                        
                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 bg-blue-50">1</button>
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

export default Home
