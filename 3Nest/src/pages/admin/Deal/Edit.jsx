import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { BASE_URL } from '../../../utils/apiPath';
import { hasPermission } from '../../../utils/permissionUtils';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';

const useUser = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    else navigate('/login');
  }, [navigate]);
  return user;
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
  const loggedInUser = useUser();
  console.log('loggedInUser:', loggedInUser);

  const [dealData, setDealData] = useState(null);
  const [dealCreatorInfo, setDealCreatorInfo] = useState(null); // State mới cho thông tin người tạo
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState(0);
  

  const token = useMemo(() => localStorage.getItem('access_token'), []);

  const fetchData = useCallback(async () => {
    if (!token || !deal_id || !loggedInUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const dealResponse = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${deal_id}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
      const dealResult = await dealResponse.json();
      if (!dealResponse.ok) throw new Error(dealResult.detail || 'Failed to load deal data');
      const fetchedDeal = dealResult.data.deal;
      console.log('Fetched Deal:', fetchedDeal.user_id);
      setDealData(fetchedDeal);

      const ordersResponse = await fetch(`${BASE_URL}/orders/get-orders-by-deal?deal_id=${deal_id}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
      const ordersResult = await ordersResponse.json();
      if (!ordersResponse.ok) throw new Error(ordersResult.detail || 'Failed to load orders');
      setOrders(ordersResult.data || []);

      const myInforResponse = await fetch(`${BASE_URL}/users/my-info`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
      const myInforResult = await myInforResponse.json();
      console.log('My Info Result:', myInforResult);
      if (!myInforResponse.ok) throw new Error(myInforResult.detail || 'Failed to load orders');
      setActiveRoleId(myInforResult.data.user_id);
      console.log('Active Role ID:', activeRoleId);
      
      if (myInforResult.data.user_id === fetchedDeal.user_id) {
        setDealCreatorInfo(loggedInUser);
      } else if (hasPermission(loggedInUser, 'deal:Full control')) {
        // Trường hợp admin xem deal của người khác -> Gọi API lấy thông tin
        const creatorResponse = await fetch(`${BASE_URL}/users/get-user?user_id=${fetchedDeal.user_id}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
        const creatorResult = await creatorResponse.json();
        if (!creatorResponse.ok) throw new Error(creatorResult.detail || 'Failed to fetch creator info');
        setDealCreatorInfo(creatorResult.data);
      } else {
        // Trường hợp không có quyền nhưng vẫn thấy (phòng hờ), chỉ hiển thị thông tin cơ bản
        setDealCreatorInfo({ user_name: `User ID: ${fetchedDeal.user_id}` });
      }
      console.log('Deal Creator Info:', dealCreatorInfo);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [deal_id, token, loggedInUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitDeal = async () => { /* ... */ };
  const handleDiscardDeal = async () => { /* ... */ };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading deal details...</div>;
  if (error) return <div className="p-4 m-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>;

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <DashboardLayout activeMenu="08">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              
            </div>
            <div className='mb-6 flex flex-col sm:flex-row justify-end gap-4 w-1/5 ml-auto'>
              {dealData?.status === 'approved' && hasPermission(loggedInUser, 'order:manage') && (
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
                  </div>
                  <div className="w-full bg-white p-6 rounded-lg shadow-md">
                  {/* <h2 className="text-xl font-semibold mb-4">Actions</h2> */}
                  <div className="space-y-4">
                    
                    {dealData?.status === 'draft' && hasPermission(loggedInUser, 'deal:manage') && (
                      <button onClick={handleSubmitDeal} disabled={processing} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
                        {processing ? 'Submitting...' : 'Submit Deal'}
                      </button>
                    )}
                    {dealData?.status === 'draft' && hasPermission(loggedInUser, 'deal:manage') && (
                      <button onClick={() => setShowConfirm(true)} disabled={processing} className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50">
                        Discard Deal
                      </button>
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
                              {orders
                                .filter(order => activeRoleId === loggedInUser.role_name || order.status !== 'draft')
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
                                        onClick={() => navigate(`/orders/edit/${order.order_id}`)}
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
        </div>
      </DashboardLayout>
      <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDiscardDeal} title="Confirm Discard" message="Are you sure? This action cannot be undone." processing={processing} />
    </>
  );
};

export default EditDealPage;