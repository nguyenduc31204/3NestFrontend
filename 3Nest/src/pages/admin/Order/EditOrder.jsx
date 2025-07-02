import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../utils/apiPath';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { generateOrderPDF } from '../../../utils/exportPDF';
import { LuArrowDownToLine } from 'react-icons/lu';

const IconButton = ({ children, title, onClick }) => (
  <button
    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
    title={title}
    onClick={onClick}
  >
    {children}
  </button>
);

const OrderDetailRow = ({ detail, index, user }) => {
  const isChannel = user?.role_name === 'channel';
  const price = isChannel ? (detail.final_price || 0) : (detail.price_for_customer || 0);
  const priceLabel = isChannel ? 'Channel Cost' : 'Price';

  return (
    <tr key={index}>
      <td className="px-4 py-4 text-sm text-gray-900">{detail.product_name || 'Unknown'}</td>
      <td className="px-4 py-4 text-sm text-gray-900">{detail.sku_partnumber || '-'}</td>
      <td className="px-4 py-4 text-sm text-gray-900">{detail.description || '-'}</td>
      <td className="px-4 py-4 text-sm text-gray-900">{detail.quantity || 0}</td>
      <td className="px-4 py-4 text-sm text-gray-900">${price.toLocaleString()}</td>
      <td className="px-4 py-4 text-sm text-gray-900">{detail.service_contract_duration || 0} year(s)</td>
      <td className="px-4 py-4 text-sm text-gray-900">
        ${(() => {
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
  )
  
};

const EditOrderAdmin = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderData, setOrderData] = useState();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { user } = useAuth();

  console.log('Current user:', user);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        };

        const orderResponse = await fetch(`${BASE_URL}/orders/get-order?order_id=${order_id}`, { headers });
        const orderResult = await orderResponse.json();
        if (!orderResponse.ok || orderResult.status_code !== 200) {
          throw new Error(orderResult.message || 'Failed to load order data');
        }
        
        if (!isMounted) return;
        setOrder(orderResult.data);

        if (orderResult.data.deal_id) {
          const dealResponse = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${orderResult.data.deal_id}`, { headers });
          const dealResult = await dealResponse.json();
          console.log('dealResult', dealResult)
          if (dealResponse.ok && dealResult.status_code === 200) {
            if (isMounted) setDeal(dealResult.data.deal);
          } else {
            console.error('Could not load deal data:', dealResult.message);
          }
        }

        const detailsResponse = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${order_id}`, { headers });
        const detailsResult = await detailsResponse.json();
        console.log('Order details2323:', detailsResult);
        if (!detailsResponse.ok || detailsResult.status_code !== 200) {
          throw new Error(detailsResult.message || 'Failed to load order details');
        }
        if (isMounted) setOrderDetails(detailsResult.data);

        const productsResponse = await fetch(`${BASE_URL}/products/get-products`, { headers });
        const productsResult = await productsResponse.json();
        if (productsResponse.ok && productsResult.status_code === 200) {
           if (isMounted) setProducts(productsResult.data);
        }

      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [order_id]);

  const handleChangeStatus = useCallback(async (newStatus, reason = '') => {
    if (newStatus === 'rejected' && !reason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);

      const requestBody = {
        order_id: parseInt(order_id),
        status: newStatus,
        reason: reason,
      };

      const response = await fetch(`${BASE_URL}/orders/change-status-of-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || `Failed to ${newStatus} order`);
      }
      
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order has been ${newStatus}.`);
      
      // Đóng modal nếu có
      if (showRejectModal) setShowRejectModal(false);
      
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An error occurred.');
    } finally {
      setProcessing(false);
    }
  }, [order_id, showRejectModal]);
  
  

  const handleSubmitOrder = useCallback(async () => {
    try {
      setProcessing(true);
      setError(null);

      const requestBody = {
        order_id: parseInt(order_id),
        order_title: order?.order_title || '',
        status: 'submitted',
        details: orderDetails.map(detail => ({
          product_id: detail.product_id,
          quantity: parseInt(detail.quantity),
          price_for_customer: parseFloat(detail.price_for_customer),
          service_contract_duration: parseInt(detail.service_contract_duration)
        }))
      };

      const response = await fetch(`${BASE_URL}/orders/update-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || 'Failed to update order');
      }
      
      setOrder(prev => ({ ...prev, status: 'submitted' }));
      toast.success('Order submitted successfully!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An error occurred.');
    } finally {
      setProcessing(false);
    }
  }, [order_id, order, orderDetails]);

  console.log('Order details:', orderDetails);

  const handleDiscardOrder = useCallback(async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/orders/delete-order?order_id=${order_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to discard order');
      }
      toast.success('Order discarded successfully!');
      navigate('/orders');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An error occurred.');
    } finally {
      setProcessing(false);
      setShowDiscardConfirm(false);
    }
  }, [order_id, navigate]);

  const isDraft = order?.status === 'draft';
  const isSubmitted = order?.status === 'submitted';
  const isAccepted = order?.status === 'approved';
  const isRejected = order?.status === 'rejected';
  const isViewOnly = isAccepted || isRejected;

  
  
  const priceColumnHeader = user?.role_name === 'channel' ? 'Channel Cost' : 'Price';
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center px-4 py-2 font-semibold text-sm text-blue-500 bg-white shadow rounded-md">
          Loading order details...
        </div>
      </div>
    );
  }

  console.log("Kiểm tra giá trị của order:", order);
  const handleExport = () => {

    if (!deal || !order || !orderDetails) {
      console.error("Dữ liệu chưa sẵn sàng để xuất PDF. Vui lòng thử lại.");
      alert("Thông tin đơn hàng chưa được tải xong, vui lòng đợi giây lát rồi thử lại.");
      return; 
    }

    const sampleOrderData = {
      order_id: order_id,
      user_name: deal.created_by, 
      date: order.created_at,  
      customer: {
        name: deal.contact_name,
        company: deal.customer_name,
        address: deal.address,
        phone: deal.phone,
        email: deal.contact_email
      },
      items: orderDetails.map(item => {

        const correctPrice = localStorage.getItem('role') === 'channel'
            ? item.final_price
            : item.price_for_customer;

        return { 
            sku_partnumber: item.sku_partnumber,
            name: item.product_name,
            unit: 'Cái',
            quantity: item.quantity,

            unitPrice: correctPrice || 0 
        };
      })
    };

    try {
      generateOrderPDF(sampleOrderData);
    } catch (error) {
      console.error("Đã xảy ra lỗi khi tạo file PDF:", error);
      alert("Đã có lỗi xảy ra trong quá trình xuất file PDF. Vui lòng thử lại.");
    }
  };

  return (
    <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {isViewOnly ? 'View Order' : isDraft ? 'Edit Order' : 'Review Quote'} #{order_id}
            </h1>
            <div className="text-sm text-gray-500">
              <span className="text-gray-500 hover:text-gray-700">Dashboard</span> / 
              <span className="text-gray-500 hover:text-gray-700">Quotes</span> / 
              <span>{isViewOnly ? 'View' : isDraft ? 'Edit' : 'Review'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 mb-4 rounded">
            <p className="text-sm font-bold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Deal Information</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                {deal ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Deal ID</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.deal_id || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Customer Name</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.customer_name || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Contact Name</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.contact_name || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Contact Email</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.contact_email || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Contact Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.contact_phone || '--'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No deal information available</p>
                )}
              </div>
              <div>
                {deal ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">TIN</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.tax_identification_number || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Address</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.address || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Billing Address</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.billing_address || '--'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{deal.description || '--'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No deal information available</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Quote Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Quote Title</label>
                <p className="mt-1 text-sm text-gray-900">{order?.order_title || '--'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Quote des</label>
                <p className="mt-1 text-sm text-gray-900">{order?.order_description || '--'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold capitalize rounded-full ${
                    isAccepted ? 'bg-green-100 text-green-800' :
                    isRejected ? 'bg-red-100 text-red-800' :
                    isSubmitted ? 'bg-blue-100 text-blue-800' :
                    isDraft ? 'bg-gray-200 text-gray-800' :
                    'bg-gray-100 text-gray-600' 
                  }`}
                >
                  {order?.status || 'N/A'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {order?.created_at ? new Date(order.created_at).toLocaleString() : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <IconButton title="Export PDF" onClick={handleExport}>
          <LuArrowDownToLine className="w-5 h-5" />
        </IconButton>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Quote Details</h2>
          {orderDetails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{priceColumnHeader}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderDetails.map((detail, index) => (
                    <OrderDetailRow key={index} detail={detail} index={index} user={user} />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-right font-bold text-sm text-gray-700">
                      Total Budget
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      ${orderDetails
                      .reduce((total, item) => {
                        const isChannel = user?.role_name === 'channel';
                        const price = isChannel ? (item.final_price || 0) : (item.price_for_customer || 0);
                        const quantity = item.quantity || 0;
                        const years = item.service_contract_duration || 1;
                        let itemTotal = 0;
                        for (let i = 0; i < years; i++) {
                          itemTotal += price * Math.pow(1.05, i);
                        }
                        return total + (itemTotal * quantity);
                      }, 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No quote details available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          {(isDraft || isRejected) && (
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Discard
            </button>
          )}
          {isDraft && (
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={processing}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 ${
                processing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processing ? 'Submitting...' : 'Submit Order'}
            </button>
          )}

          {isSubmitted && (user?.role_name === 'manager') && (
            <>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 ${
                  processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleChangeStatus('approved')}
                disabled={processing}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
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
            disabled={processing}
          >
            Back
          </button>
        </div>

        {showRejectModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Reason for Rejection</h2>
              <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this quote. This will be visible to the user who created the quote.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason here..."
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleChangeStatus('rejected', rejectReason)}
                  disabled={processing}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDiscardConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Confirm Discard</h2>
              <p className="mb-6">Are you sure you want to discard this quote? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDiscardOrder}
                  disabled={processing}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? 'Discarding...' : 'Discard'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditOrderAdmin;