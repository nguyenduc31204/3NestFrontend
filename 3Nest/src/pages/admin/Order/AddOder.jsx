import { useEffect, useState } from "react";
import DasboardLayout from "../../../components/layouts/DashboardLayout"
import Header from "../../../components/layouts/Header"
import { decodeToken } from "../../../utils/help";
import AddOrderDialog from "../../../components/order/AddOrderDialog";
import { fetchProductsByTypeAndRole } from "../../../hook/fetchProduct";
import { BASE_URL } from "../../../utils/apiPath";

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

const AddOrder = () => {
  const [activeRole, setActiveRole] = useState('sales');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(1);
  const [user, setUser] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
   
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    loadProducts();
  }, [activeRole, selectedTypeId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const products = await fetchProductsByTypeAndRole({
        baseUrl: BASE_URL,
        typeId: selectedTypeId,
        role: activeRole,
        token,
      });
      setProducts(products);
      setLoading(false);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Failed to load products: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
      fetch(`${BASE_URL}/users/my-info`,{
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })
        .then(res => res.json())
        .then(data => setUser(data.data));
  }, []);

  const handleAddOrderClick = () => {
    setIsDialogOpen(true);
  };
  console.log("user", user)
  const handleSubmitOrder = (orderData) => {
    console.log('Dữ liệu đơn hàng gửi:', orderData);
    setIsDialogOpen(false);
  };

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
  };

  const decode = decodeToken(token);

  const handleRefresh = () => {
    if (selectedTypeId && activeRole) {
      loadProducts();
    }
  };

  return (
    <div>
      <Header />
      <DasboardLayout activeMenu="Orders">
        <div className='my-5 mx-auto'>
          <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
                <div className="page-title">
                  <h1 className='text-2xl font-semibold mb-2'>Order Details</h1>
                  <div className="breadcrumb text-gray-500 text-sm hover:text-slate-500">
                      <a href="#" className='text-gray-500'>Dashboard</a> / Order
                  </div>
                </div>
                <button
                  className="btn btn-primary max-w-[200px]"
                  onClick={handleAddOrderClick}
                >
                  <i className="fas fa-plus"></i> Add item
                </button>
            </div>

            <div className="product-role flex space-x-2 bg-gray-50 p-4">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRole === 'sales'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => handleRoleChange('sales')}
              >
                Sales
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRole === 'channels'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => handleRoleChange('channels')}
              >
                Channels
              </button>
            </div>

            {activeRole === 'sales' && (
              <div className="flex justify-center">
                <div className="w-full max-w-5xl">
                  <h1 className="text-2xl font-semibold mb-6">Order Sales</h1>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username Sales</label>
                        <p className="text-base text-gray-800">{user?.user_name || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-base text-gray-800">{user?.user_email || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <p className="text-base text-gray-800">{user?.phone || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name Company</label>
                        <p className="text-base text-gray-800">{user?.company_name || '--'}</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Order Title</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Enter order title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Enter billing address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'channels' && (
              <div className="flex justify-center mt-8">
                <div className="w-full max-w-5xl">
                  <h1 className="text-2xl font-semibold mb-6">Order Channels</h1>
                  <p className="text-gray-600">Kênh phân phối...</p>
                </div>
              </div>
            )}

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
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
                      Loading orders...
                    </div>
                  </div>
                )}

                <div className="table-responsive overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{activeRole === 'sales' ? 'Sales' : 'Channel'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {!loading && products.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            No orders found for the selected criteria
                          </td>
                        </tr>
                      ) : (
                        products.map((order, index) => (
                          order.details.map((detail, detailIndex) => (
                            <tr key={`${order.order_title}-${detail.product_id}-${detailIndex}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{order.order_title || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{detail.product_id || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{order.customer_name || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{detail.quantity || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{detail.service_contract_duration || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {detail.price_for_customer && detail.quantity 
                                  ? `${(detail.price_for_customer * detail.quantity).toLocaleString()}`
                                  : '-'}
                              </td>
                            </tr>
                          ))
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

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
          <AddOrderDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleSubmitOrder}
            activeRole={activeRole}
          />
        </div>
      </DasboardLayout>
    </div>
  )
}

export default AddOrder