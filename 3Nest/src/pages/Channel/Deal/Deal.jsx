import React, { useEffect } from 'react'
import Header from '../../../components/layouts/Header'
import { decodeToken } from '../../../utils/help';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../utils/apiPath';
import DashboardLayout from '../../../components/layouts/DashboardLayout';

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

const DealChannel = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); 

  const token = localStorage.getItem('access_token');
  const decodedToken = decodeToken(token);
  const userId = decodedToken?.user_id;

  console.log("decodedToken", decodedToken)
  useEffect(() => {
    loadDealsByUser();
  }, []);

  const loadDealsByUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/deals/get-deals-by-user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const result = await response.json();
      
        setDeals(result.data);
    } catch (err) {
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  console.log("deals",deals)


  return (
    <div>
      <Header/>
      <DashboardLayout activeMenu="08">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Channel Deals Management</h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / My Deals
                </div>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm sm:text-base flex items-center gap-2 touch-manipulation"
                onClick={() => navigate('/channel/adddeals')}
              >
                <i className="fas fa-plus"></i> Add New Deals
              </button>
            </div>

            <div className="stats-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="stat-card rounded-lg p-4 shadow-md bg-white">
                <div className="stat-icon bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuCoins className="w-5 h-5" />
                </div>
                <div className="stat-value text-xl font-bold text-gray-800">{deals.length}</div>
                <div className="stat-label text-gray-500 text-sm">Total Deals</div>
              </div>
              <div className="stat-card rounded-lg p-4 shadow-md bg-white">
                <div className="stat-icon bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuWalletMinimal className="w-5 h-5" />
                </div>
                <div className="stat-value text-xl font-bold text-gray-800">
                  {deals.filter((deals) => deals.status === 'approved').length}
                </div>
                <div className="stat-label text-gray-500 text-sm">Approved Orders</div>
              </div>
              <div className="stat-card rounded-lg p-4 shadow-md bg-white">
                <div className="stat-icon bg-yellow-100 text-yellow-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuPersonStanding className="w-5 h-5" />
                </div>
                <div className="stat-value text-xl font-bold text-gray-800">
                  {deals.filter((deals) => deals.status === 'draft').length}
                </div>
                <div className="stat-label text-gray-500 text-sm">Draft Deals</div>
              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-header flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 gap-4">
                <h2 className="text-lg font-semibold text-gray-800">My Deals</h2>
                <div className="tools flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md touch-manipulation">
                    <LuArrowDownToLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md touch-manipulation">
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md touch-manipulation"
                    // onClick={handleRefresh}
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
                    <div className="inline-flex items-center px-4 py-2 font-semibold text-sm text-blue-500 bg-white shadow rounded-md">
                      Loading orders...
                    </div>
                  </div>
                )}

                {!loading && (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block table-responsive overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIN</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th> */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {deals.length === 0 ? (
                            <tr>
                              <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                                No orders found
                              </td>
                            </tr>
                          ) : (
                            deals.map((order, index) => (
                              <tr key={order.order_id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">#{order.deal_id}</td>
                                <td className="px-4 py-4 text-sm text-gray-900">{decodedToken.user_email}</td>
                                <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[150px]">{decodedToken.user_name || '-'}</td>
                                <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[150px]">{order.customer_name || '-'}</td>
                                
                                <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[120px]">{order.tax_indentification_number || '-'}</td>
                                <td className="px-4 py-4 text-sm">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      order.status === 'submited'
                                        ? 'bg-green-100 text-green-800'
                                        : order.status === 'draft'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : order.status === 'approved'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {order.status === 'draft' ? 'Draft' : order.status === 'submited' ? 'Submited' : order.status === 'approved' ? 'Approved' : order.status || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900">
                                  {new Date(order.created_at).toLocaleDateString() || '--'}
                                </td>
                                {/* <td className="px-4 py-4 text-sm text-gray-900">
                                  ${order.total_budget?.toLocaleString() || '0'}
                                </td> */}
                                <td className="px-4 py-4 text-sm text-gray-900 flex flex-wrap gap-2">
                                  <button
                                    className="text-yellow-600 hover:text-yellow-800 text-xs sm:text-sm touch-manipulation"
                                    onClick={() => navigate(`/channel/editdeals/${order.deal_id}`)}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="block md:hidden divide-y divide-gray-200">
                      {deals.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No orders found</div>
                      ) : (
                        deals.map((order) => (
                          <div key={order.order_id} className="p-4 bg-white hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-800">Order #{order.order_id}</span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'Approved'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'submited'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {order.status === 'draft' ? 'Draft' : order.status === 'submited' ? 'Submitted' : order.status || 'Unknown'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Title:</strong> {order.order_title || '-'}</p>
                              <p><strong>Customer:</strong> {order.customer_name || '-'}</p>
                              <p><strong>Total:</strong> ${order.total_budget?.toLocaleString() || '0'}</p>
                              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString() || '--'}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                className="text-yellow-600 hover:text-yellow-800 text-sm touch-manipulation"
                                onClick={() => navigate(`/channel/editdeals/${order.order_id}`)}
                              >
                                View
                              </button>
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
                    <span className="font-medium">{deals.length}</span> of{' '}
                    <span className="font-medium">{deals.length}</span> results
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

            {/* Order Detail Dialog */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Order #{selectedOrder.order_id}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Order Title:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.order_title || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Customer Name:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.customer_name || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Contact Name:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.contact_name || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Contact Email:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.contact_email || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Contact Phone:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.contact_phone || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Address:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.address || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Billing Address:</span>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedOrder.billing_address || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Order Date:</span>
                      <p className="text-gray-900 text-sm sm:text-base">
                        {new Date(selectedOrder.created_at).toLocaleDateString() || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Status:</span>
                      <p
                        className={`inline-flex px-2 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                          selectedOrder.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : selectedOrder.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedOrder.status === 'submited'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedOrder.status === 'draft' ? 'Draft' : selectedOrder.status === 'submited' ? 'Submitted' : selectedOrder.status || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold mb-4">Order Details</h3>
                  <div className="table-responsive overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-4 text-sm text-gray-500 text-center">
                              No products found
                            </td>
                          </tr>
                        ) : (
                          products.map((detail, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                                {detail.product_name || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">{detail.quantity || 0}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                ${detail.price_for_customer?.toLocaleString() || '0'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {detail.service_contract_duration || 0} year
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                ${(detail.quantity * detail.price_for_customer || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm sm:text-base touch-manipulation"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default DealChannel
