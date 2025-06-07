import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import { decodeToken } from '../../../utils/help';
import { BASE_URL } from '../../../utils/apiPath';
import { LuRefreshCcw } from 'react-icons/lu';
import AddOrderDialog from './AddOrderDialog';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ChannelAddOrder = () => {
  const navigate = useNavigate();
  const { order_id } = useParams();
  const location = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeRole, setActiveRole] = useState('channel');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [existingDetails, setExistingDetails] = useState([]);
  const [createdOrderId, setCreatedOrderId] = useState(
    order_id ? Number(order_id) : localStorage.getItem('createdOrderId') || null
  );

  // Extract deal_id from query parameters
  const queryParams = new URLSearchParams(location.search);
  const preSelectedDealId = queryParams.get('deal_id') ? Number(queryParams.get('deal_id')) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      deal_id: preSelectedDealId || '',
      order_title: '',
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (preSelectedDealId) {
      const validatePreSelectedDeal = async () => {
        try {
          const response = await fetch(`${BASE_URL}/deals/get-deal?deal_id=${preSelectedDealId}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const result = await response.json();
          console.log("re", result)
          if (result.status_code === 200 && result.data.status === 'accepted') {
            setValue('deal_id', preSelectedDealId);
            setDeals([result.data]); 
          } else {
            setError('Selected deal is not accepted or does not exist');
            setValue('deal_id', '');
          }
        } catch (err) {
          setError(`Failed to validate deal: ${err.message}`);
          setValue('deal_id', '');
        }
      };
      validatePreSelectedDeal();
    }
  }, [preSelectedDealId, setValue]);
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    } else {
      setError('No authentication token found');
    }

    const loaduser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/my-info`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        // if (result.status_code !== 200 || !Array.isArray(result.data)) {
        //   throw new Error(result.message || 'Invalid product data');
        // }
        setUser(result.data);
      } catch (err) {
        setError(`Failed to load products: ${err.message}`);
      }
    };
    const loadProductsByTypeAndRole = async () => {
      try {
        const response = await fetch(`${BASE_URL}/products/get-products-by-role`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        if (result.status_code !== 200 || !Array.isArray(result.data)) {
          throw new Error(result.message || 'Invalid product data');
        }
        setProducts(result.data);
      } catch (err) {
        setError(`Failed to load products: ${err.message}`);
      }
    };

    const loadAllOrders = async () => {
      try {
        const response = await fetch(`${BASE_URL}/orders/get-order-by-user`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        setAllOrders(result.data);
      } catch (err) {
        // setError(`Failed to load orders: ${err.message}`);
        console.log(err)
      }
    };

    const loadDealsByUser = async () => {
      if (!preSelectedDealId) {
        try {
          const response = await fetch(`${BASE_URL}/deals/get-deals-by-user`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const result = await response.json();
          if (result.status_code === 200 && Array.isArray(result.data)) {
            // Filter deals with status 'accepted'
            const acceptedDeals = result.data.filter((deal) => deal.status === 'accepted');
            setDeals(acceptedDeals);
          } else {
            throw new Error(result.message || 'Failed to load deals');
          }
        } catch (err) {
          setError(`Failed to load deals: ${err.message}`);
        }
      }
    };

    const loadOrderDetails = async () => {
      if (order_id || createdOrderId) {
        const idToUse = order_id ? Number(order_id) : createdOrderId;
        try {
          const response = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${idToUse}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const result = await response.json();
          console.log("re", result.data)
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
      await Promise.all([loadProductsByTypeAndRole(), loaduser(), loadAllOrders(), loadDealsByUser(), loadOrderDetails()]);
      setLoading(false);
    };

    loadData();
  }, [activeRole, order_id, createdOrderId, preSelectedDealId, setValue]);
  console.log(user)
  useEffect(() => {
    if (order_id || createdOrderId) {
      const idToUse = order_id ? Number(order_id) : createdOrderId;
      const matchedOrder = allOrders.find((order) => order.order_id === idToUse);
      if (matchedOrder) {
        // Verify deal status for existing order
        const deal = deals.find((d) => d.deal_id === matchedOrder.deal_id);
        if (deal && deal.status === 'accepted') {
          setOrderData(matchedOrder);
          setValue('order_title', matchedOrder.order_title || '');
          setValue('deal_id', matchedOrder.deal_id || preSelectedDealId || '');
        } else {
          setError('The deal for this order is not accepted');
        }
      } else if (allOrders.length > 0) {
        setError(`Order with ID ${idToUse} not found`);
      }
    }
  }, [order_id, createdOrderId, allOrders, deals, preSelectedDealId, setValue]);

  const handleDelete = async () => {
    const orderIdToUse = order_id ? Number(order_id) : createdOrderId;
    if (!orderIdToUse) {
      setError('No order ID available for deletion');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/orders/delete-order?order_id=${orderIdToUse}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete order: ${response.statusText}`);
      }

      reset();
      setOrderData(null);
      setExistingDetails([]);
      setCreatedOrderId(null);
      localStorage.removeItem('createdOrderId');
      navigate(`/channel/editdeals/${formValues.deal_id || preSelectedDealId || 0}`);
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveOrder = async () => {
    // Validate deal status
    const selectedDeal = deals.find((deal) => deal.deal_id === Number(formValues.deal_id));
    if (!selectedDeal || selectedDeal.status !== 'accepted') {
      setError('Cannot save order: Selected deal is not accepted');
      return;
    }

    try {
      const orderIdToUse = order_id ? Number(order_id) : createdOrderId;
      let response;
      const updatedData = {
        deal_id: Number(formValues.deal_id) || preSelectedDealId || 0,
        order_title: formValues.order_title || '',
        status: 'draft',
        details: existingDetails.map((detail) => ({
          product_id: detail.product_id || 0,
          quantity: detail.quantity || 0,
          price_for_customer: detail.price_for_customer || 0,
          service_contract_duration: detail.service_contract_duration || 0,
        })),
      };

      const updatedData2 = {
        order_id: orderIdToUse,
        deal_id: Number(formValues.deal_id) || preSelectedDealId || 0,
        order_title: formValues.order_title || '',
        status: 'draft',
        details: existingDetails.map((detail) => ({
          product_id: detail.product_id || 0,
          quantity: detail.quantity || 0,
          price_for_customer: detail.price_for_customer || 0,
          service_contract_duration: detail.service_contract_duration || 0,
        })),
      };

      if (orderIdToUse) {
        response = await fetch(`${BASE_URL}/orders/update-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(updatedData2),
        });
      } else {
        response = await fetch(`${BASE_URL}/orders/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(updatedData),
        });
      }

      const result = await response.json();
      // if (!response.ok || result.status_code !== 200) {
      //   throw new Error(result.message || 'Failed to save order');
      // }

      if (!orderIdToUse && result.data) {
        const newOrderId = result.data.order_id || result.data.id;
        if (newOrderId) {
          setCreatedOrderId(newOrderId);
          localStorage.setItem('createdOrderId', newOrderId);
        }
      }

      reset();
      setOrderData(null);
      setExistingDetails([]);
      setCreatedOrderId(null);
      localStorage.removeItem('createdOrderId');
      navigate(`/channel/editdeals/${formValues.deal_id || preSelectedDealId || 0}`);
    } catch (err) {
      // setError(`Failed to save order: ${err.message}`);
    }
  };
  console.log("existingDetails", existingDetails)
  const handleSubmitOrder = async () => {
    // Validate deal status
    const selectedDeal = deals.find((deal) => deal.deal_id === Number(formValues.deal_id));
    if (!selectedDeal || selectedDeal.status !== 'accepted') {
      setError('Cannot submit order: Selected deal is not accepted');
      return;
    }

    try {
      const orderIdToUse = order_id ? Number(order_id) : createdOrderId;
      let response;
      const updatedData = {
        deal_id: Number(formValues.deal_id) || preSelectedDealId || 0,
        order_title: formValues.order_title || '',
        status: 'submitted',
        details: existingDetails.map((detail) => ({
          product_id: detail.product_id || 0,
          quantity: detail.quantity || 0,
          price_for_customer: detail.price_for_customer || 0,
          service_contract_duration: detail.service_contract_duration || 0,
        })),
      };

      if (orderIdToUse) {
        response = await fetch(`${BASE_URL}/orders/update-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ order_id: orderIdToUse, ...updatedData }),
        });
      } else {
        response = await fetch(`${BASE_URL}/orders/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(updatedData),
        });
      }

      const result = await response.json();
      if (!response.ok || result.status_code !== 200) {
        throw new Error(result.message || 'Failed to submit order');
      }

      if (!orderIdToUse && result.data) {
        const newOrderId = result.data.order_id || result.data.id;
        if (newOrderId) {
          setCreatedOrderId(newOrderId);
          localStorage.setItem('createdOrderId', newOrderId);
        }
      }

      reset();
      setOrderData(null);
      setExistingDetails([]);
      setCreatedOrderId(null);
      localStorage.removeItem('createdOrderId');
      navigate(`/channel/editdeals/${formValues.deal_id || preSelectedDealId || 0}`);
    } catch (err) {
      setError(`Failed to submit order: ${err.message}`);
    }
  };

  const handleAddOrderClick = () => {
    // Validate deal status before opening dialog
    const selectedDealId = Number(formValues.deal_id) || preSelectedDealId;
    const selectedDeal = deals.find((deal) => deal.deal_id === selectedDealId);
    if (!selectedDeal || selectedDeal.status !== 'accepted') {
      setError('Cannot add items: Please select an accepted deal');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = (data) => {
    const updatedDetails = [...existingDetails];
    data.details.forEach((newDetail) => {
      const existingIndex = updatedDetails.findIndex(
        (d) => d.product_id === newDetail.product_id
      );
      if (existingIndex >= 0) {
        updatedDetails[existingIndex].quantity += newDetail.quantity;
        updatedDetails[existingIndex].price_for_customer = newDetail.price_for_customer;
        updatedDetails[existingIndex].service_contract_duration = newDetail.service_contract_duration;
      } else {
        updatedDetails.push({
          product_id: newDetail.product_id,
          product_name: products.find((p) => p.product_id === newDetail.product_id)?.product_name || 'Unknown',
          sku_partnumber: products.find((p) => p.product_id === newDetail.product_id)?.sku_partnumber || '-',
          quantity: newDetail.quantity,
          price_for_customer: newDetail.price_for_customer,
          service_contract_duration: newDetail.service_contract_duration,
        });
      }
    });
    setExistingDetails(updatedDetails);
    setOrderData({ ...data, details: updatedDetails });
    setIsDialogOpen(false);
  };

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
  };

  const handleRefresh = () => {
    setLoading(true);
    setProducts([]);
    setAllOrders([]);
    setDeals([]);
    setExistingDetails([]);
    setError(null);

    const loadData = async () => {
      try {
        const productsResponse = await fetch(`${BASE_URL}/products/get-products-by-role`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const productsResult = await productsResponse.json();
        if (productsResult.status_code === 200 && Array.isArray(productsResult.data)) {
          setProducts(productsResult.data);
        }

        const ordersResponse = await fetch(`${BASE_URL}/orders/get-order-by-user`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const ordersResult = await ordersResponse.json();
        if (ordersResult.status_code === 200 && Array.isArray(ordersResult.data)) {
          setAllOrders(ordersResult.data);
        }

        if (!preSelectedDealId) {
          const dealsResponse = await fetch(`${BASE_URL}/deals/get-deals-by-user`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const dealsResult = await dealsResponse.json();
          if (dealsResult.status_code === 200 && Array.isArray(dealsResult.data)) {
            // Filter accepted deals
            const acceptedDeals = dealsResult.data.filter((deal) => deal.status === 'accepted');
            setDeals(acceptedDeals);
          }
        }

        if (order_id || createdOrderId) {
          const idToUse = order_id ? Number(order_id) : createdOrderId;
          const detailsResponse = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${idToUse}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const detailsResult = await detailsResponse.json();
          if (detailsResult.status_code === 200 && Array.isArray(detailsResult.data)) {
            setExistingDetails(detailsResult.data);
          }
        }
      } catch (err) {
        setError(`Failed to refresh data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  };

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="04">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Order Details</h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Order
                </div>
              </div>
            </div>

            <div className="product-role flex space-x-2 bg-gray-50 p-4 rounded-md">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeRole === 'channel'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => handleRoleChange('channel')}
              >
                Channel
              </button>
            </div>

            {activeRole === 'channel' && (
              <div className="mt-6">
                <div className="w-full max-w-4xl mx-auto">
                  <h1 className="text-xl sm:text-2xl font-semibold mb-6">Order Channel</h1>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username Channel</label>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Order Time</label>
                        <p className="text-base text-gray-800">
                          {new Date(orderData?.created_at).toLocaleDateString() || '--'} {' '}
                          {new Date(orderData?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--'}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Deal</label>
                        {preSelectedDealId ? (
                          <p className="text-base text-gray-800">
                            {deals.find((deal) => deal.deal_id === preSelectedDealId)?.customer_name || preSelectedDealId}
                          </p>
                        ) : (
                          <select
                            {...register('deal_id', { required: 'Deal is required' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                            disabled={orderData?.status && orderData.status !== 'draft'}
                          >
                            <option value="">Select a deal</option>
                            {deals.map((deal) => (
                              <option key={deal.deal_id} value={deal.deal_id}>
                                {deal.customer_name || `Deal ${deal.deal_id}`}
                              </option>
                            ))}
                          </select>
                        )}
                        {errors.deal_id && (
                          <p className="text-red-600 text-sm mt-1">{errors.deal_id.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Order Title</label>
                        <input
                          {...register('order_title', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter order title"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
                        {errors.order_title && (
                          <p className="text-red-600 text-sm mt-1">{errors.order_title.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Order Details</h3>
                      {!['submitted', 'accepted', 'draft'].includes(orderData?.status || '') && (
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 touch-manipulation"
                          onClick={handleAddOrderClick}
                        >
                          <i className="fas fa-plus"></i> Add Item
                        </button>
                      )}
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
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                              {/* <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Description</th> */}
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Price</th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Duration</th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {existingDetails.map((detail, index) => (
                              <tr key={index}>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">
                                  {detail.product_name || 'Unknown'}
                                </td>
                                {/* <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                                  {detail.descrription || '-'}
                                </td> */}
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
                            ))}
                          </tbody>
                        </table>
                        <div className="text-right mt-3 sm:mt-4 px-2 sm:px-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">Total Budget</label>
                          <p className="text-sm sm:text-base text-gray-800">
                            ${orderData?.total_budget || (() => {
                              const details = orderData?.details || [];
                              let total = 0;
                              for (let detail of details) {
                                const price = detail.price_for_customer || 0;
                                const quantity = detail.quantity || 0;
                                const years = detail.service_contract_duration || 1;

                                let subtotal = 0;
                                for (let i = 0; i < years; i++) {
                                  subtotal += price * Math.pow(1.05, i);
                                }

                                total += subtotal * quantity;
                              }
                              return Math.round(total).toLocaleString();
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(!orderData || orderData?.status === 'draft' || orderData?.status === '') && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm sm:text-base touch-manipulation"
                        disabled={!order_id && !createdOrderId}
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleSubmit(handleSaveOrder)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm sm:text-base touch-manipulation"
                        disabled={existingDetails.length === 0 || !formValues.deal_id}
                      >
                        Save as Draft
                      </button>
                      <button
                        onClick={handleSubmit(handleSubmitOrder)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm sm:text-base touch-manipulation"
                        disabled={existingDetails.length === 0 || !formValues.deal_id}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                  <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
                  <p className="mb-6">Bạn có chắc chắn muốn xóa đơn hàng này không?</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowConfirm(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AddOrderDialog
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onSubmit={handleDialogSubmit}
              activeRole={activeRole}
              order_title={formValues.order_title}
              existingDetails={existingDetails}
            />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default ChannelAddOrder;