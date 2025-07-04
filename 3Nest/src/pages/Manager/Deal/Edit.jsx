
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';

import { BASE_URL } from '../../../utils/apiPath';

const ManaEditDeal = () => {
  const navigate = useNavigate();
  const { deal_id } = useParams();
  const [dealData, setDealData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');


  const isViewOnly = dealData?.status !== 'submitted';
  const isDraft = dealData?.status === 'draft';

  useEffect(() => {


    const loadDealData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${deal_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        if (result.status_code === 200) {

          setDealData(result.data.deal);

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
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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


  useEffect(() => {
    const loadUser = async () => {
      if (!dealData?.user_id) return;
      try {
        const response = await fetch(`${BASE_URL}/users/get-user?user_id=${dealData.user_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        if (result.status_code === 200) {
          setUser(result.data);
        }
      } catch (err) {
        setError(`Failed to load user data: ${err.message}`);
      }
    };

    loadUser();
  }, [dealData?.user_id]);

  const handleStatusChange = async (newStatus, reason = '') => {

    setProcessing(true);
    setSuccessMessage('');
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/deals/change-status-of-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          deal_id: parseInt(deal_id),
          status: newStatus,

          reason: reason,

        }),
      });

      const result = await response.json();
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || `Failed to ${newStatus} deal`);
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

        setDealData(updatedResult.data.deal);
        setSuccessMessage(`Deal ${newStatus} successfully!`);
      }

    } catch (err) {
      setError(`Failed to update deal status: ${err.message}`);
    } finally {
      setProcessing(false);

      setShowApproveConfirm(false);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectError('');
    }
  };

  const handleApprove = () => {
    setShowApproveConfirm(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Please provide a reason for rejection.');
      return;
    }
    handleStatusChange('rejected', rejectReason);
  };


  if (isDraft && !loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Draft deals are not visible in this view.
      </div>
    );
  }

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="08">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                  {isViewOnly ? 'View Deal' : 'Review Deal'} #{deal_id}
                </h1>
                <div className="text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Deal
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

            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading deal details...</div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">Deal Information</h1>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deal ID</label>
                      <p className="text-base text-gray-800">{dealData?.deal_id || '--'}</p>
                    </div>
                    <div>

                      <label className="block text-sm font-medium text-gray-700">User Name</label>

                      <p className="text-base text-gray-800">{user?.user_name || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User Email</label>
                      <p className="text-base text-gray-800">{user?.user_email || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User Contact</label>
                      <p className="text-base text-gray-800">{user?.phone || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="text-base text-gray-800">{user?.company_name || '--'}</p>
                    </div>
                    <div>

                      <label className="block text-sm font-medium text-gray-700">Created At</label>

                      <p className="text-base text-gray-800">
                        {dealData?.created_at
                          ? new Date(dealData.created_at).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : '--'}
                      </p>
                    </div>

                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tax Identification Number</label>
                      <p className="text-base text-gray-800">{dealData?.tax_indentification_number || '--'}</p>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-base text-gray-800">{dealData?.address || '--'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-base text-gray-800">{dealData?.description || '--'}</p>
                    </div>

                  </div>
                </div>
                {!isViewOnly && (
                  <div className="flex gap-2 w-full justify-end mt-6">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm flex items-center gap-2 touch-manipulation"

                      onClick={() => setShowRejectModal(true)}

                      disabled={processing}
                    >
                      Reject
                    </button>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center gap-2 touch-manipulation"

                      onClick={handleApprove}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Approve'}

                    </button>
                  </div>
                )}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Orders for Deal</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders associated with this deal.</p>
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
                            .filter((order) => order.status !== 'draft')
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
                                    onClick={() => navigate(`/manager/editorder/${order.order_id}`)}
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
              </div>
            )}


            {/* Approval Confirmation Modal */}
            {showApproveConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                  <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
                  <p className="mb-6 text-sm text-gray-600">Are you sure you want to approve this deal?</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowApproveConfirm(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStatusChange('approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason Modal */}
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
        </div>
      </DashboardLayout>
    </div>
  );
};


export default ManaEditDeal;

