import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import { decodeToken } from '../../../utils/help';
import { BASE_URL } from '../../../utils/apiPath';
import {
  LuChevronsLeft,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsRight,
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw,
} from 'react-icons/lu';
import AddOrderDialog from './AddOrderDialog';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

const SalesAddOrder = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const { order_id } = useParams();
  const [activeRole, setActiveRole] = useState('sales');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [existingDetails, setExistingDetails] = useState([]);
  const [createdOrderId, setCreatedOrderId] = useState(
    order_id ? Number(order_id) : localStorage.getItem('createdOrderId') || null
  );
  const [selectedOrder, setSelectedOrder] = useState(null); 


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      order_title: '',
      customer_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      billing_address: '',
    },
  });

  const formValues = watch();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    } else {
      setError('No authentication token found');
    }

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
        if (result.status_code === 200 && Array.isArray(result.data)) {
          setAllOrders(result.data);
        } else {
          throw new Error(result.message || 'Failed to load orders');
        }
      } catch (err) {
        setError(`Failed to load orders: ${err.message}`);
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
      await Promise.all([loadProductsByTypeAndRole(), loadAllOrders(), loadOrderDetails()]);
      setLoading(false);
    };

    loadData();
  }, [activeRole, order_id, createdOrderId]);
  const orderIdToUse = order_id ? Number(order_id) : createdOrderId;


  useEffect(() => {
    if (order_id || createdOrderId) {
      const idToUse = order_id ? Number(order_id) : createdOrderId;
      const matchedOrder = allOrders.find((order) => order.order_id === idToUse);
      if (matchedOrder) {
        setOrderData(matchedOrder);
        setValue('order_title', matchedOrder.order_title || '');
        setValue('customer_name', matchedOrder.customer_name || '');
        setValue('contact_name', matchedOrder.contact_name || '');
        setValue('contact_email', matchedOrder.contact_email || '');
        setValue('contact_phone', matchedOrder.contact_phone || '');
        setValue('address', matchedOrder.address || '');
        setValue('billing_address', matchedOrder.billing_address || '');
      } else if (allOrders.length > 0) {
        setError(`Order with ID ${idToUse} not found`);
      }
    }
  }, [order_id, createdOrderId, allOrders, setValue]);

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

      const result = await response.json();
      console.log('Order deleted:', result);

      // Refresh orders list
      const ordersResponse = await fetch(`${BASE_URL}/orders/get-order`, {
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

      reset();
      setOrderData(null);
      setExistingDetails([]);
      setCreatedOrderId(null);
      localStorage.removeItem('createdOrderId');
      navigate('/sales/orders');
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
      console.error('Delete failed:', err);
    }
  };

  const handleSaveOrder = async () => {
    try {
      const orderIdToUse = order_id ? Number(order_id) : createdOrderId;
      let response;
      const updatedData = {
        order_title: formValues.order_title || '',
        status: 'draft',
        customer_name: formValues.customer_name || '',
        contact_name: formValues.contact_name || '',
        contact_email: formValues.contact_email || '',
        contact_phone: formValues.contact_phone || '',
        address: formValues.address || '',
        billing_address: formValues.billing_address || '',
        details: existingDetails.map((detail) => ({
          product_id: detail.product_id || 0,
          quantity: detail.quantity || 0,
          price_for_customer: detail.price_for_customer || 0,
          service_contract_duration: detail.service_contract_duration || 0,
        })),
      };

      const updatedData2 = {
        order_id: orderIdToUse,
        order_title: formValues.order_title || '',
        status: 'draft',
        customer_name: formValues.customer_name || '',
        contact_name: formValues.contact_name || '',
        contact_email: formValues.contact_email || '',
        contact_phone: formValues.contact_phone || '',
        address: formValues.address || '',
        billing_address: formValues.billing_address || '',
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
        console.log('Create Order Input:', updatedData);
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

      if (!orderIdToUse) {
        const newOrderId = result.data.order_id || result.data.id;
        if (newOrderId) {
          setCreatedOrderId(newOrderId);
          localStorage.setItem('createdOrderId', newOrderId);
        }
      }

      // Refresh orders list
      const ordersResponse = await fetch(`${BASE_URL}/orders/get-order`, {
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

      reset();
      setOrderData(null);
      setExistingDetails([]);
      setCreatedOrderId(null);
      localStorage.removeItem('createdOrderId');
      navigate('/sales/orders');
    } catch (err) {
      setError(`Failed to save order: ${err.message}`);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const orderIdToUse = order_id ? Number(order_id) : createdOrderId;
      let response;
      const updatedData = {
        order_id: orderIdToUse,
        order_title: formValues.order_title || '',
        status: 'submitted',
        customer_name: formValues.customer_name || '',
        contact_name: formValues.contact_name || '',
        contact_email: formValues.contact_email || '',
        contact_phone: formValues.contact_phone || '',
        address: formValues.address || '',
        billing_address: formValues.billing_address || '',
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
          body: JSON.stringify(updatedData),
        });
      } else {
        console.log('Create Order Input (submitted):', updatedData);
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

      if (!orderIdToUse) {
        const newOrderId = result.data.order_id || result.data.id;
        if (newOrderId) {
          setCreatedOrderId(newOrderId);
          localStorage.setItem('createdOrderId', newOrderId);
        }
      }

      // Refresh orders list
      const ordersResponse = await fetch(`${BASE_URL}/orders/get-order`, {
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

      reset();
      setOrderData(null);
      setExistingDetails([]);
      setCreatedOrderId(null);
      localStorage.removeItem('createdOrderId');
      navigate('/sales/orders');
    } catch (err) {
      setError(`Failed to submit order: ${err.message}`);
    }
  };

  const handleAddOrderClick = () => {
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

        const ordersResponse = await fetch(`${BASE_URL}/orders/get-order`, {
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
  console.log("order", orderData)

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
                  activeRole === 'sales'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => handleRoleChange('sales')}
              >
                Sales
              </button>
            </div>

            {activeRole === 'sales' && (
              <div className="mt-6">
                <div className="w-full max-w-4xl mx-auto">
                  <h1 className="text-xl sm:text-2xl font-semibold mb-6">Order Sales</h1>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Username Sales</label>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                        <input
                          {...register('customer_name', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter customer name"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                        <input
                          {...register('contact_name', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter contact name"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                        <input
                          {...register('contact_email', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter contact email"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                        <input
                          {...register('contact_phone', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter contact phone"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          {...register('address', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter address"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                        <input
                          {...register('billing_address', { required: 'Order title is required' })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                          placeholder="Enter billing address"
                          disabled={orderData?.status && orderData.status !== 'draft'}
                        />
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
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Description</th>
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
                          ${orderData?.total_budget || '--'}
                        </p>
                      </div>
                    </div>
                    )}
                  </div>

                  {(!orderData || orderData?.status === 'draft' || orderData?.status === '') && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                      {/* <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm sm:text-base touch-manipulation"
                        disabled={!order_id && !createdOrderId}
                      >
                        Discard
                      </button> */}
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
                        disabled={existingDetails.length === 0}
                      >
                        Save as Draft
                      </button>
                      <button
                        onClick={handleSubmit(handleSubmitOrder)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm sm:text-base touch-manipulation"
                        disabled={existingDetails.length === 0}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>

                
              </div>
            )}

            {activeRole === 'channels' && (
              <div className="mt-8">
                <div className="w-full max-w-4xl mx-auto">
                  <h1 className="text-xl sm:text-2xl font-semibold mb-6">Order Channels</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Channel distribution details...</p>
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
              customer_name={formValues.customer_name}
              contact_name={formValues.contact_name}
              contact_email={formValues.contact_email}
              contact_phone={formValues.contact_phone}
              address={formValues.address}
              billing_address={formValues.billing_address}
              existingDetails={existingDetails}
            />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default SalesAddOrder;
