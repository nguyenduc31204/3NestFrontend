import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { BASE_URL } from '../../../utils/apiPath';
import { hasPermission } from '../../../utils/permissionUtils';
import { useAuth } from '../../../context/AuthContext';

import {
  LuChevronsLeft,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsRight,
} from 'react-icons/lu';
import { decodeToken } from '../../../utils/help';
import { set } from 'react-hook-form';

const IconButton = ({ children, title, onClick }) => (
  <button
    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
    title={title}
    onClick={onClick}
  >
    {children}
  </button>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t">
      <span className="text-sm text-gray-700">
        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
      </span>
      <div className="flex items-center space-x-1">
        <IconButton title="First Page" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          <LuChevronsLeft />
        </IconButton>
        <IconButton title="Previous Page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <LuChevronLeft />
        </IconButton>
        <IconButton title="Next Page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <LuChevronRight />
        </IconButton>
        <IconButton title="Last Page" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          <LuChevronsRight />
        </IconButton>
      </div>
    </div>
  );
};



const ConfirmationModal = ({ isOpen, onClose, onConfirm, processing, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} disabled={processing} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-medium">Cancel</button>
          <button onClick={onConfirm} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50">
            {processing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div>
    <strong className="block font-medium text-gray-500 text-xs sm:text-sm">{label}</strong>
    <p className="text-gray-900 mt-1 text-sm sm:text-base whitespace-pre-wrap">{value || '--'}</p>
  </div>
);


const EditDealPage = () => {
  const navigate = useNavigate();
  const { deal_id } = useParams();
  // const loggedInUser = useUser();
  // console.log('loggedInUser:', loggedInUser);

  const [dealData, setDealData] = useState(null);
  const [dealCreatorInfo, setDealCreatorInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState(0);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const ITEMS_PER_PAGE = 10;
  const [role, setRole] = useState(null);
  

  const token = useMemo(() => localStorage.getItem('access_token'), []);

  const fetchData = useCallback(async () => {
    if (!token || !deal_id || !user) return;
    
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };

      const [dealResponse, ordersResponse] = await Promise.all([
        fetch(`${BASE_URL}/deals/get-deal?deal_id=${deal_id}`, { headers }),
        fetch(`${BASE_URL}/orders/get-orders-by-deal?deal_id=${deal_id}`, { headers })
      ]);

      if (!dealResponse.ok) throw new Error((await dealResponse.json()).detail || 'Failed to load deal data');
      const dealResult = await dealResponse.json();
      const fetchedDeal = dealResult.data.deal;

      const ordersResult = await ordersResponse.json();
      const fetchedOrders = ordersResult.data || [];

      let creatorInfo = null;
      if (user.user_id === fetchedDeal.user_id) {
        creatorInfo = user;
      } else if (hasPermission(user, 'deal:review')) {
        const creatorResponse = await fetch(`${BASE_URL}/users/get-user?user_id=${fetchedDeal.user_id}`, { headers });
        if (!creatorResponse.ok) throw new Error((await creatorResponse.json()).detail || 'Failed to fetch creator info');
        let partialCreatorInfo = (await creatorResponse.json()).data;

        if (partialCreatorInfo && !partialCreatorInfo.role_name && partialCreatorInfo.role_id) {
            console.log(`Role name is missing for user ${partialCreatorInfo.user_id}. Fetching role...`);
            const roleResponse = await fetch(`${BASE_URL}/roles/get-role?request_id=${partialCreatorInfo.role_id}`, { headers });
            if (roleResponse.ok) {
                const roleResult = await roleResponse.json();
                creatorInfo = { ...partialCreatorInfo, role_name: roleResult.data.role_name };
            } else {
                console.error('Could not fetch role name for creator.');
                creatorInfo = { ...partialCreatorInfo, role_name: 'Unknown Role' };
            }
        } else {
            creatorInfo = partialCreatorInfo;
        }
      } else {
        creatorInfo = { user_name: `User ID: ${fetchedDeal.user_id}`, role_name: 'N/A' };
      }

      console.log('Fetched Deal:', creatorInfo);

      setDealData(fetchedDeal);
      setOrders(fetchedOrders);
      setDealCreatorInfo(creatorInfo);
      setRole(creatorInfo.role_name || 'N/A');

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [deal_id, token, user]);
  
  const handleChangeStatus = useCallback(async (newStatus, reason = '') => {
    if (newStatus === 'rejected' && !reason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch(`${BASE_URL}/deals/change-status-of-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ deal_id: parseInt(deal_id), status: newStatus, reason: reason }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `Failed to ${newStatus} deal`);
      
      setDealData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Deal has been ${newStatus}.`);
      setShowRejectModal(false);
      setRejectReason('');

    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  }, [deal_id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

    const handleSubmitDeal = async () => {
    setProcessing(true);
    setError('');
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
        toast.success('Deal submitted successfully');
      }
    } catch (err) {
      setError(`Failed to submit deal: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return orders.slice(startIndex, endIndex);
  }, [orders, currentPage]);


  const totalPages = useMemo(() => {
    return Math.ceil(orders.length / ITEMS_PER_PAGE);
  }, [orders]);
  
  console.log('Deal Data:', dealData);
  
  const handleDiscardDeal = async () => {
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
  
      toast.success('Deal discarded successfully');
      navigate('/deals');
    } catch (err) {
      // setError(`Failed to discard deal: ${err.message}`);
    } finally {
      setProcessing(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading deal details...</div>;
  if (error) return <div className="p-4 m-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>;

  return (
    <>
      <Toaster position="top-right" />
      {/* <DashboardLayout activeMenu="08"> */}
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              
            </div>
            <div className='mb-6 flex flex-col sm:flex-row justify-end gap-4 w-1/5 ml-auto'>
              {dealData?.status === 'approved' && hasPermission(user, 'order:manage') && (
              <button onClick={() => navigate(`/orders/add?deal_id=${deal_id}`)} disabled={processing} className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium">
                + Add Order to Deal
              </button>
            )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="w-full bg-white p-6 sm:p-8 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-6 border-b pb-4">Deal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoField label="Customer Name" value={dealData?.customer_name} />
                    <InfoField label="Tax ID" value={dealData?.tax_identification_number} />
                    <InfoField label="Contact Name" value={dealData?.contact_name} />
                    <InfoField label="Contact Phone" value={dealData?.contact_phone} />
                    <InfoField label="Contact Email" value={dealData?.contact_email} />
                    <InfoField label="Address" value={dealData?.address} />
                    <InfoField label="Billing Address" value={dealData?.billing_address} />
                    <InfoField label="Domain Name" value={dealData?.domain_name} />
                    <InfoField label="Deal Type" value={dealData?.deal_type} />
                    <InfoField label="Status" value={<span className="capitalize font-semibold">{dealData?.status}</span>} />
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <InfoField label="Description" value={dealData?.description || 'No description provided.'} />
                  </div>
                </div>

                
              </div>
              
              <div className="space-y-8">
                <div className="w-full bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Creator Info</h2>
                  <div className="space-y-4 text-sm">
                    <InfoField label="Username" value={dealCreatorInfo?.user_name} />
                    <InfoField label="Email" value={dealCreatorInfo?.user_email} />
                    <InfoField label="Phone" value={dealCreatorInfo?.phone} />
                    <InfoField label="Company" value={dealCreatorInfo?.company_name} />
                    <InfoField label="role" value={role} />
                  </div>
                  <div className="w-full bg-white p-6 rounded-lg shadow-md">
                  {/* <h2 className="text-xl font-semibold mb-4">Actions</h2> */}
                  <div className="space-y-4">
                    
                    {dealData?.status === 'draft' && hasPermission(user, 'deal:manage') && (
                    <>
                      <button onClick={handleSubmitDeal} disabled={processing} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
                        {processing ? 'Submitting...' : 'Submit Deal'}
                      </button>
                      <button onClick={() => setShowConfirm(true)} disabled={processing} className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50">
                        Discard Deal
                      </button>
                    </>
                  )}

                  {/* Nút Approve và Reject cho người có quyền review */}
                  {dealData?.status === 'submitted' && (user?.role_name === 'manager') && (
                    <>
                      <button onClick={() => handleChangeStatus('approved')} disabled={processing} className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:opacity-50">
                        {processing ? 'Processing...' : 'Approve'}
                      </button>
                      <button onClick={() => setShowRejectModal(true)} disabled={processing} className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 font-medium disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                    {dealData?.status !== 'draft' && dealData?.status !== 'approved' && <p className="text-sm text-gray-500">No actions available for this deal status.</p>}
                  </div>
                </div>
                </div>
                
                
              </div>
            </div>
            <div className="w-full bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">Orders for this Deal</h2>
                {orders.length === 0 ? (
                      <p className="text-gray-500 text-sm">No orders associated with this deal.</p>
                    ) : (
                      <div className="mt-6">
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
                              {currentOrders
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
                                            : order.status === 'draft'
                                            ? 'bg-gray-200 text-gray-800'
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
                                        onClick={() => navigate(`/orders/edit/${order.order_id}`)}
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <PaginationControls 
                            currentPage={currentPage}
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage}
                          />
                        </div>
                      )}
                    </div>
                    )}
            </div>
          </div>
        </div>
      {/* </DashboardLayout> */}
      <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDiscardDeal} title="Confirm Discard" message="Are you sure? This action cannot be undone." processing={processing} />

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Reason for Rejection</h2>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this deal.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason here..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-medium">Cancel</button>
              <button onClick={() => handleChangeStatus('rejected', rejectReason)} disabled={processing} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50">
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditDealPage;