import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const OrderDetailRow = ({ detail, index }) => (
  <tr key={index}>
    <td className="px-4 py-4 text-sm text-gray-900">{detail.product_name || 'Unknown'}</td>
    <td className="px-4 py-4 text-sm text-gray-900">{detail.sku_partnumber || '-'}</td>
    <td className="px-4 py-4 text-sm text-gray-900">{detail.description || '-'}</td>
    <td className="px-4 py-4 text-sm text-gray-900">{detail.quantity || 0}</td>
    <td className="px-4 py-4 text-sm text-gray-900">${detail.price_for_customer?.toLocaleString() || '0'}</td>
    <td className="px-4 py-4 text-sm text-gray-900">{detail.service_contract_duration || 0} year(s)</td>
    <td className="px-4 py-4 text-sm text-gray-900">
      ${(() => {
        const price = detail.price_for_customer || 0;
        const quantity = detail.quantity || 0;
        const years = detail.service_contract_duration || 1;
        let total = 0;
        for (let i = 0; i < years; i++) {
          total += price * Math.pow(1.05, i);
        }
        return Math.round(total * quantity).toLocaleString();
      })()}
    </td>
  </tr>
);

const EditOrderMana = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const isSubmitted = order?.status === 'submitted';
  const isDraft = order?.status === 'draft';
  const isViewOnly = order?.status !== 'submitted';
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'ngrok-skip-browser-warning': 'true',
      };

      // Fetch order data
      const orderResponse = await fetch(`${BASE_URL}/orders/get-order?order_id=${order_id}`, { headers });
      const orderResult = await orderResponse.json();
      if (!orderResponse.ok || orderResult.status_code !== 200) {
        throw new Error(orderResult.message || 'Failed to load order data');
      }
      setOrder(orderResult.data);

      // Fetch deal data if order has deal_id
      if (orderResult.data.deal_id) {
        const dealResponse = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${orderResult.data.deal_id}`, { headers });
        const dealResult = await dealResponse.json();
        if (!dealResponse.ok || dealResult.status_code !== 200) {
          throw new Error(dealResult.message || 'Failed to load deal data');
        }

        setDeal(dealResult.data.deal);

      }

      // Fetch order details
      const detailsResponse = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${order_id}`, { headers });
      const detailsResult = await detailsResponse.json();
      if (!detailsResponse.ok || detailsResult.status_code !== 200) {
        throw new Error(detailsResult.message || 'Failed to load order details');
      }
      setOrderDetails(detailsResult.data);

      // Fetch all products
      const productsResponse = await fetch(`${BASE_URL}/products/get-products`, { headers });
      const productsResult = await productsResponse.json();
      if (productsResponse.ok && productsResult.status_code === 200) {
        setProducts(productsResult.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [order_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Please provide a reason for rejection.');
      return;
    }
    handleStatusChange('rejected', rejectReason);
  };
  const handleStatusChange = useCallback(
    async (newStatus, reason) => {

      try {
        setProcessing(true);
        setError(null);
        setSuccessMessage('');

        const response = await fetch(`${BASE_URL}/orders/change-status-of-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            order_id: parseInt(order_id),
            status: newStatus,

            reason: reason,

          }),
        });

        const result = await response.json();
        // if (!response.ok || result.status_code !== 200) {
        //   throw new Error(result.message || `Failed to ${newStatus} order`);
        // }

        // Refresh order data
        await fetchData();
        setSuccessMessage(`Order ${newStatus} successfully!`);
      } catch (err) {
        setError(err.message);
      } finally {
        setProcessing(false);

        setShowRejectModal(false);
        setRejectReason('');
        setRejectError('');

      }
    },
    [order_id, fetchData]
  );


  if (isDraft && !loading) {
    return (
      <div>
        <Header />
        <DashboardLayout activeMenu="04">
          <div className="p-4 text-center text-gray-500">Draft orders are not visible in this view.</div>
        </DashboardLayout>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Header />
        <DashboardLayout activeMenu="04">
          <div className="p-8 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold text-sm text-blue-500 bg-white shadow rounded-md">
              Loading order details...
            </div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="04">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                  {isViewOnly ? 'View Order' : 'Review Order'} #{order_id}
                </h1>
                <div className="text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Orders / {isViewOnly ? 'View' : 'Review'}
                </div>
                {successMessage && (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-sm border border-green-300">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Deal Information</h2>

                <div className='grid grid-cols-3 gap-6 mb-8'>
                  <div className=''>
                    {deal ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Deal ID</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.deal_id || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.customer_name || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.contact_name || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.contact_email || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.contact_phone || '--'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No deal information available</p>
                  )}  
                  </div>
                  <div className=''>
                    {deal ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">TIN</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.tax_indentification_number || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.address || '--'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Builling Address</label>
                        <p className="mt-1 text-sm text-gray-900">{deal.billing_address || '--'}</p>
                      </div>
                      
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No deal information available</p>
                  )}  
                  </div>
                </div>

              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Order Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Title</label>
                    <p className="mt-1 text-sm text-gray-900">{order?.order_title || '--'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p
                      className={`mt-1 text-sm capitalize ${

                        order?.status === 'approved'

                          ? 'text-green-800'
                          : order?.status === 'rejected'
                          ? 'text-red-800'
                          : order?.status === 'submitted'
                          ? 'text-blue-800'
                          : 'text-gray-900'
                      }`}
                    >
                      {order?.status || '--'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Budget</label>
                    <p className="mt-1 text-sm text-gray-900">
                      ${orderDetails.reduce((total, item) => total + (item.price_for_customer * item.quantity || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order?.created_at ? new Date(order.created_at).toLocaleString() : '--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              {orderDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderDetails.map((detail, index) => (
                        <OrderDetailRow key={index} detail={detail} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No order details available</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              {!isViewOnly && (
                <>
                  <button

                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm flex items-center gap-2 touch-manipulation"
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                    >
                      Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange('approved')}

                    disabled={processing}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 ${
                      processing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >

                    {processing ? 'Processing...' : 'Approve'}

                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {showRejectModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Reject Deal</h2>
                  <p className="mb-4 text-sm text-gray-600">Please provide a reason for rejecting this deal.</p>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows="4"
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      setRejectError('');
                    }}
                    placeholder="Enter rejection reason..."
                  />
                  {rejectError && (
                    <p className="text-sm text-red-600 mt-2">{rejectError}</p>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectReason('');
                        setRejectError('');
                      }}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            )}

    </div>
  );
};

export default EditOrderMana;