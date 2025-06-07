import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import { decodeToken } from '../../../utils/help';
import { BASE_URL } from '../../../utils/apiPath';
import { useNavigate, useParams } from 'react-router-dom';

const AddOrderMana = () => {
  const navigate = useNavigate();
  const { order_id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingDetails, setExistingDetails] = useState([]);
  const [createdOrderId] = useState(
    order_id ? Number(order_id) : localStorage.getItem('createdOrderId') || null
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    } else {
      setError('No authentication token found');
      navigate('/login');
      return;
    }

    const loadOrder = async () => {
      if (!order_id && !createdOrderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }
      const idToUse = order_id ? Number(order_id) : createdOrderId;
      try {
        const response = await fetch(`${BASE_URL}/orders/get-order?order_id=${idToUse}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        console.log('Order API Response:', result); // Debug
        if (result.status_code === 200 && result.data) {
          setOrderData(result.data);
        } else {
          throw new Error(result.message || 'Failed to load order');
        }
      } catch (err) {
        setError(`Failed to load order: ${err.message}`);
      }
    };

    const loadOrderDetails = async () => {
      if (order_id || createdOrderId) {
        const idToUse = order_id ? Number(order_id) : createdOrderId;
        try {
          const response = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${idToUse}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const result = await response.json();
          console.log('Order Details API Response:', result); // Debug
          if (result.status_code === 200 && Array.isArray(result.data)) {
            setExistingDetails(result.data);
          } else {
            throw new Error(result.message || 'Failed to load order details');
          }
        } catch (err) {
          setError(`Failed to load order details: ${err.message}`);
        }
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadOrder(), loadOrderDetails()]);
      setLoading(false);
    };

    loadData();
  }, [order_id, createdOrderId, navigate]);

  const handleStatusChange = async (newStatus) => {
    const orderIdToUse = order_id ? Number(order_id) : createdOrderId;
    if (!orderIdToUse) {
      setError('No order ID available');
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/orders/change-status-of-order?status=${newStatus}&order_id=${orderIdToUse}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      const result = await response.json();
      console.log('Change Status API Response:', result); // Debug
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || `Failed to update order status to ${newStatus}`);
      }

      navigate('/admin/');
    } catch (err) {
      setError(`Failed to update order status: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading order details...</div>
    );
  }

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="04">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                  Order #{orderData?.order_id || order_id || createdOrderId || 'Loading...'}
                </h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> /{' '}
                  <a href="/admin/" className="text-gray-500 hover:text-gray-700">Orders</a> / View Order
                </div>
              </div>
            </div>

            <div className="w-full max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
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
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-base text-gray-800">{user?.company_name || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Time</label>
                    <p className="text-base text-gray-800">
                      {orderData?.created_at
                        ? `${new Date(orderData.created_at).toLocaleDateString()} ${new Date(
                            orderData.created_at
                          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : '--'}
                    </p>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Title</label>
                    <p className="text-base text-gray-800">{orderData?.order_title || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="text-base text-gray-800">{orderData?.customer_name || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <p className="text-base text-gray-800">{orderData?.contact_name || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <p className="text-base text-gray-800">{orderData?.contact_email || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <p className="text-base text-gray-800">{orderData?.contact_phone || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="text-base text-gray-800">{orderData?.address || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                    <p className="text-base text-gray-800">{orderData?.billing_address || '--'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Order Details</h3>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading order details...</div>
                ) : existingDetails.length === 0 ? (
                  <p className="text-gray-500 text-sm">No products added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                            Description
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                            Price
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                            Duration
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {existingDetails.map((detail, index) => (
                          <tr key={index}>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">
                              {detail.product_name || 'Unknown'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                              {detail.description || '-'}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                              {detail.quantity || 0}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                              ${(detail.price_for_customer || 0).toLocaleString()}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                              {detail.service_contract_duration || 0} years
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                              ${((detail.price_for_customer || 0) * (detail.quantity || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-right mt-3 sm:mt-4 px-2 sm:px-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Total Budget</label>
                      <p className="text-sm sm:text-base text-gray-800">
                        ${orderData?.total_budget?.toLocaleString() || '--'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {orderData?.status === 'submitted' && (
                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base touch-manipulation"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange('accepted')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base touch-manipulation"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default AddOrderMana;
