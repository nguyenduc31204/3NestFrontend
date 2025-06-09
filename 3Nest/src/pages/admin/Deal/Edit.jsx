import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import { decodeToken } from '../../../utils/help';
import { BASE_URL } from '../../../utils/apiPath';
import { useParams, useNavigate } from 'react-router-dom';

const AdminEditDeal = () => {
  const navigate = useNavigate();
  const { deal_id } = useParams();
  const [dealData, setDealData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    } else {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    const loadDealData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${deal_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        console.log("re", result)
        if (result.status_code === 200) {
          setDealData(result.data.deal);
          setIsEditable(result.data.role === 'admin');
        } else {
          throw new Error(result.message || 'Failed to load deal data');
        }
      } catch (err) {
        setError(`Failed to load deal: ${err.message}`);
      }
    };

    const loadOrdersByDeal = async () => {
      try {
        const response = await fetch(`${BASE_URL}/orders/get-orders-by-deal?deal_id=${deal_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        if (result.status_code === 200 && Array.isArray(result.data)) {
          setOrders(result.data);
        } else {
          throw new Error(result.message || 'Failed to load orders');
        }
      } catch (err) {
        setError(`Failed to load orders: ${err.message}`);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadDealData(), loadOrdersByDeal()]);
      setLoading(false);
    };

    loadData();
  }, [deal_id]);

  const handleNavigateToAddOrder = () => {
    navigate(`/admin/orders/add?deal_id=${deal_id}`);
  };

  const handleSubmitDeal = async () => {
    if (!isEditable) {
      setError('You can only submit deals created by admin.');
      return;
    }
    setProcessing(true);
    setSuccessMessage('');
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/deals/update-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          deal_id: deal_id,
          status: 'submitted',
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || 'Failed to submit deal');
      }

      const updatedResponse = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${deal_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const updatedResult = await updatedResponse.json();
      if (updatedResult.status_code === 200) {
        setDealData(updatedResult.data);
        setSuccessMessage('Deal submitted successfully!');
      }
    } catch (err) {
      setError(`Failed to submit deal: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDiscardDeal = async () => {
    if (!isEditable) {
      setError('You can only discard deals created by admin.');
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch(`${BASE_URL}/deals/delete-deal?deal_id=${deal_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || 'Failed to discard deal');
      }

      navigate('/admin/deals');
    } catch (err) {
      setError(`Failed to discard deal: ${err.message}`);
    } finally {
      setProcessing(false);
      setShowConfirm(false);
    }
  };
  console.log("dealData", dealData)

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="08">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Deal Details</h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Deal
                </div>
                {successMessage && (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-sm border border-green-300">
                    {successMessage}
                  </div>
                )}
                {/* {!isEditable && (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 text-sm border border-yellow-300">
                    This deal was created by {dealData?.created_by_role || 'unknown'}. You can only view it.
                  </div>
                )} */}
              </div>
              {isEditable && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center gap-2 touch-manipulation"
                  onClick={handleNavigateToAddOrder}
                  disabled={processing}
                >
                  <i className="fas fa-plus"></i> Add Order
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading deal details...</div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-xl sm:text-2xl font-semibold mb-6">Deal Information</h1>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deal ID</label>
                      <p className="text-base text-gray-800">{dealData?.deal_id || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                      <p className="text-base text-gray-800">{dealData?.customer_name || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                      <p className="text-base text-gray-800">{dealData?.contact_name || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                      <p className="text-base text-gray-800">{dealData?.contact_email || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                      <p className="text-base text-gray-800">{dealData?.contact_phone || '--'}</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-base text-gray-800">{dealData?.address || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                      <p className="text-base text-gray-800">{dealData?.billing_address || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax Identification Number</label>
                      <p className="text-base text-gray-800">{dealData?.tax_indentification_number || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domain Name</label>
                      <p className="text-base text-gray-800">{dealData?.domain_name || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deal Type</label>
                      <p className="text-base text-gray-800">{dealData?.deal_type || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="text-base text-gray-800">{dealData?.status || '--'}</p>
                    </div>
                  </div>
                </div>
                {isEditable && dealData?.status === 'draft' && (
                  <div className="flex gap-2 w-full justify-end mt-6">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm flex items-center gap-2 touch-manipulation"
                      onClick={() => setShowConfirm(true)}
                      disabled={processing}
                    >
                      Discard
                    </button>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 touch-manipulation"
                      onClick={handleSubmitDeal}
                      disabled={processing}
                    >
                      {processing ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                )}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Orders for Deal</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders associated with this deal.</p>
                  ) : (
                    <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Orders for Deal</h3>
                    {orders.filter(order => order.status !== 'draft').length === 0 ? (
                      <p className="text-gray-500 text-sm">No non-draft orders associated with this deal.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orders
                              .filter(order => order.status !== 'draft')
                              .map((order, index) => (
                                <tr key={order.order_id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                                  <td className="px-4 py-4 text-sm text-gray-900">#{order.order_id}</td>
                                  <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[150px]">{order.order_title || '-'}</td>
                                  <td className="px-4 py-4 text-sm">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        order.status === 'submitted'
                                          ? 'bg-blue-100 text-blue-800'
                                          : order.status === 'approved'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {order.status === 'submitted' ? 'Submitted' : 
                                      order.status === 'approved' ? 'Approved' : 
                                      order.status || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    ${order.total_budget?.toLocaleString() || '0'}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900">
                                    {new Date(order.created_at).toLocaleDateString() || '--'}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-900 flex flex-wrap gap-2">
                                    <button
                                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm touch-manipulation"
                                      onClick={() => navigate(`/admin/editorder/${order.order_id}`)}
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discard Confirmation Dialog */}
        {showConfirm && isEditable && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h2 className="text-lg font-semibold mb-4">Confirm Discard</h2>
              <p className="mb-6">Are you sure you want to discard this deal? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDiscardDeal}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Discard'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </div>
  );
};

export default AdminEditDeal;