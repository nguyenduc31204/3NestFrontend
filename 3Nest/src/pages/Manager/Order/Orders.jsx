import React, { useEffect, useState } from 'react';
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
  LuRefreshCcw,
} from 'react-icons/lu';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../../utils/help';

const OrdersMana = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem('access_token');
  const decodedToken = decodeToken(token);

  useEffect(() => {
    if (!token) {
      setError('No authentication token found');
      navigate('/login');
      return;
    }
    loadOrdersByRole();
  }, []);

  const loadOrdersByRole = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/orders/get-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      console.log('Orders API Response:', result); 
      if (result.status_code === 200 && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        throw new Error(result.message || 'Invalid orders data format');
      }
    } catch (err) {
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${BASE_URL}/orders/change-status-of-order?status=${newStatus}&order_id=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      const result = await response.json();
      console.log('Change Status API Response:', result); // Debug
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || `Failed to update order status to ${newStatus}`);
      }
      loadOrdersByRole();
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  const loadProductChoose = async (pro_id) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${pro_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const result = await response.json();
      console.log('Order Details API Response:', result); // Debug
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || 'Failed to load order details');
      }
      setProducts(result.data);
    } catch (err) {
      setError(`Failed to load order details: ${err.message}`);
    }
  };

  useEffect(() => {
    if (selectedOrder?.order_id) {
      loadProductChoose(selectedOrder.order_id);
    }
  }, [selectedOrder]);

  const handleRefresh = () => {
    loadOrdersByRole();
  };

  console.log("orders", orders)

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="04">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Orders Management</h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> /{' '}
                  <a href="/admin/" className="text-gray-500 hover:text-gray-700">My Orders</a>
                </div>
              </div>
            </div>

            <div className="stats-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="stat-card rounded-lg p-4 shadow-md bg-white">
                <div className="stat-icon bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuCoins className="w-5 h-5" />
                </div>
                <div className="stat-value text-xl font-bold text-gray-800">{orders.length}</div>
                <div className="stat-label text-gray-500 text-sm">Total Orders</div>
              </div>
              <div className="stat-card rounded-lg p-4 shadow-md bg-white">
                <div className="stat-icon bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuWalletMinimal className="w-5 h-5" />
                </div>
                <div className="stat-value text-xl font-bold text-gray-800">
                  {orders.filter((order) => order.status === 'accepted').length}
                </div>
                <div className="stat-label text-gray-500 text-sm">Accepted Orders</div>
              </div>
              <div className="stat-card rounded-lg p-4 shadow-md bg-white">
                <div className="stat-icon bg-yellow-100 text-yellow-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuPersonStanding className="w-5 h-5" />
                </div>
                <div className="stat-value text-xl font-bold text-gray-800">
                  {orders.filter((order) => order.status === 'submitted').length}
                </div>
                <div className="stat-label text-gray-500 text-sm">Submit Orders</div>
              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 gap-4">
                <h2 className="text-lg font-semibold text-gray-800">Admin Orders</h2>
                <div className="tools flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md touch-manipulation">
                    <LuArrowDownToLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md touch-manipulation">
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md touch-manipulation"
                    onClick={handleRefresh}
                  >
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

                {loading && (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold text-sm text-blue-500 bg-white shadow rounded-lg">
                      Loading orders...
                    </div>
                  </div>
                )}

                {!loading && (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block table-responsive overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                No orders found
                              </td>
                            </tr>
                          ) : (
                            orders.map((order, index) => (
                              <tr key={order.order_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">#{order.order_id}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[150px]">{order.order_title || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[150px]">{order.user_email || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[120px]">{order.customer_name || '-'}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      order.status === 'submitted'
                                        ? 'bg-blue-100 text-blue-800'
                                        : order.status === 'draft'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : order.status === 'accepted'
                                        ? 'bg-green-100 text-green-800'
                                        : order.status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {order.status === 'draft'
                                      ? 'Draft'
                                      : order.status === 'submitted'
                                      ? 'Submitted'
                                      : order.status === 'accepted'
                                      ? 'Accepted'
                                      : order.status === 'rejected'
                                      ? 'Rejected'
                                      : order.status || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  ${order.total_budget?.toLocaleString() || '0'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(order.created_at).toLocaleDateString() || '--'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 flex flex-wrap gap-2">
                                  <button
                                    className="text-yellow-600 hover:text-yellow-800 text-xs sm:text-sm touch-manipulation"
                                    onClick={() => navigate(`/manager/editorder/${order.order_id}`)}
                                  >
                                    View Details
                                  </button>
                                  
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="block sm:hidden divide-y divide-gray-200">
                      {orders.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No orders found</div>
                      ) : (
                        orders.map((order) => (
                          <div key={order.order_id} className="p-4 bg-white hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-800">Order #{order.order_id}</span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'submitted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'accepted'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {order.status === 'draft'
                                  ? 'Draft'
                                  : order.status === 'submitted'
                                  ? 'Submitted'
                                  : order.status === 'accepted'
                                  ? 'Accepted'
                                  : order.status === 'rejected'
                                  ? 'Rejected'
                                  : order.status || 'Unknown'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Title:</strong> {order.order_title || '-'}</p>
                              <p><strong>Customer:</strong> {order.customer_name || '-'}</p>
                              <p><strong>Total:</strong> ${order.total_budget?.toLocaleString() || '0'}</p>
                              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString() || '--'}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <button
                                className="text-yellow-600 hover:text-yellow-800 text-sm touch-manipulation"
                                onClick={() => navigate(`/manager/editorder/${order.order_id}`)}
                              >
                                View Details
                              </button>
                              {order.status === 'submitted' && (
                                <>
                                  <button
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm touch-manipulation"
                                    onClick={() => handleStatusChange(order.order_id, 'accepted')}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm touch-manipulation"
                                    onClick={() => handleStatusChange(order.order_id, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                <div className="pagination flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">{orders.length}</span> of{' '}
                    <span className="font-medium">{orders.length}</span> results
                  </div>
                  <nav className="flex rounded-md shadow-sm -space-x-px">
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md touch-manipulation">
                      <LuChevronsLeft className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 touch-manipulation">
                      <LuChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                      1
                    </button>
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 touch-manipulation">
                      <LuChevronRight className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md touch-manipulation">
                      <LuChevronsRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default OrdersMana;
