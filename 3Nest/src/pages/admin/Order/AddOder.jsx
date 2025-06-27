import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FiTrash2, FiPlusCircle, FiSave, FiCheckSquare } from 'react-icons/fi';

import { useAuth } from '../../../context/AuthContext';
import { BASE_URL } from '../../../utils/apiPath';
import AddOrderDialog from './AddOrderDialog';

const InfoField = ({ label, value }) => (
  <div>
    <strong className="block font-medium text-gray-500 text-sm">{label}</strong>
    <p className="text-gray-900 mt-1">{value || '--'}</p>
  </div>
);

const OrderItemRow = ({ field, index, register, remove, watch, isReadOnly }) => {
  const watchedItem = watch(`details.${index}`);

  // Tính toán subtotal cho từng dòng
  const subtotal = useMemo(() => {
    const price = watchedItem.price_for_customer || 0;
    const quantity = watchedItem.quantity || 0;
    const years = watchedItem.service_contract_duration || 1;
    let itemTotal = 0;
    for (let i = 0; i < years; i++) {
      itemTotal += price * Math.pow(1.05, i);
    }
    return Math.round(itemTotal * quantity);
  }, [watchedItem]);

  return (
    <tr key={field.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{field.product_name}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="1"
          {...register(`details.${index}.quantity`, { valueAsNumber: true, min: { value: 1, message: "Min 1" } })}
          className="w-20 p-1 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          disabled={isReadOnly}
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">${(field.price_for_customer || 0).toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{field.service_contract_duration || 0} years</td>
      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">${subtotal.toLocaleString()}</td>
      {!isReadOnly && (
        <td className="px-4 py-3 text-center">
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            title="Remove item"
          >
            <FiTrash2 />
          </button>
        </td>
      )}
    </tr>
  );
};


const AddOrderPageRefactored = () => {
  const navigate = useNavigate();
  const { order_id } = useParams();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState();
  const [orderStatus, setOrderStatus] = useState('draft');

  const queryParams = new URLSearchParams(location.search);
  const preSelectedDealId = queryParams.get('deal_id') ? Number(queryParams.get('deal_id')) : null;
  console.log('Pre-selected Deal ID:', preSelectedDealId);

  // React Hook Form Setup
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      deal_id: preSelectedDealId || '',
      order_title: '',
      order_description: '',
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "details" });
  const watchedDetails = watch("details");
  const watchedDealId = watch("deal_id");

  // Data Fetching
  useEffect(() => {
    if (!user) return;
    const loadInitialData = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };
      
      try {
        const [productsResponse, dealsResponse] = await Promise.all([
          fetch(`${BASE_URL}/products/get-products-by-role`, { headers }),
          preSelectedDealId ? fetch(`${BASE_URL}/deals/get-deal?deal_id=${preSelectedDealId}`, { headers }) : Promise.resolve(null)
        ]);
        // console.log('1122Response:', productsResponse.json());

        if (!productsResponse.ok) throw new Error('Failed to load products');
        const productsResult = await productsResponse.json();
        console.log('1122Response:', productsResult);
        setProducts(productsResult.data || []);

        if (dealsResponse) {
          if (!dealsResponse.ok) throw new Error('Failed to load deals');
          const dealsResult = await dealsResponse.json();
          console.log('Deals:', dealsResult.data.deal);
          if (dealsResult.data && dealsResult.data.deal.status === 'approved') {
              setDeals([dealsResult.data.deal]);
          } else {
              setDeals([]);
          }
        }

        if (order_id) {
          const orderResponse = await fetch(`${BASE_URL}/orders/get-order?order_id=${order_id}`, { headers });
          if (!orderResponse.ok) throw new Error('Failed to load order data');
          const orderResult = await orderResponse.json();
          const order = orderResult.data;
          
          const detailsResponse = await fetch(`${BASE_URL}/orders/get-order-details-by-order?order_id=${order_id}`, { headers });
          if (!detailsResponse.ok) throw new Error('Failed to load order details');
          const detailsResult = await detailsResponse.json();
          
          reset({
            deal_id: order.deal_id,
            order_title: order.order_title,
            order_description: order.order_description,
            details: detailsResult.data,
            created_at: order.created_at, 
          });
          setOrderStatus(order.status);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [user, order_id, preSelectedDealId, reset]);
   console.log('deal:', deals);

  // Logic tính toán Total Budget
  const totalBudget = useMemo(() => {
    return watchedDetails.reduce((acc, item) => {
      const price = item.price_for_customer || 0;
      const quantity = item.quantity || 0;
      const years = item.service_contract_duration || 1;
      let itemTotal = 0;
      for (let i = 0; i < years; i++) {
        itemTotal += price * Math.pow(1.05, i);
      }
      return acc + (itemTotal * quantity);
    }, 0);
  }, [watchedDetails]);

  // Handlers
  const handleDialogSubmit = (dataFromDialog) => {
    // lấy mảng `details` từ bên trong object đó.
    const selectedProducts = dataFromDialog.details || [];
    
    // Lọc ra những sản phẩm mới chưa có trong danh sách
    const newProducts = selectedProducts.filter(p_new => 
      !watchedDetails.some(p_old => p_old.product_id === p_new.product_id)
    );
    
    // Định dạng lại dữ liệu trước khi thêm vào form
    const formattedProducts = newProducts.map(p => ({
        product_id: p.product_id,
        product_name: products.find(prod => prod.product_id === p.product_id)?.product_name || 'Unknown',
        price_for_customer: p.price_for_customer,
        quantity: p.quantity,
        service_contract_duration: p.service_contract_duration,
    }));
    
    append(formattedProducts);
  };
  
  const handleFormSubmit = async (data, status) => {
    if(fields.length === 0) {
      toast.error("Please add at least one item to the order.");
      return;
    }

    setIsSubmitting(true);
    const action = order_id ? 'Updating' : 'Creating';
    const toastId = toast.loading(`${action} order...`);
    
    const payload = { ...data, status, details: data.details.map(d => ({
        product_id: d.product_id,
        quantity: Number(d.quantity),
        price_for_customer: Number(d.price_for_customer),
        service_contract_duration: Number(d.service_contract_duration)
    }))};
    if (order_id) payload.order_id = Number(order_id);
    
    try {
      const url = order_id ? `${BASE_URL}/orders/update-order` : `${BASE_URL}/orders/create-order`;
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'ngrok-skip-browser-warning': 'true'}, body: JSON.stringify(payload)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Failed to save order');
      
      toast.success(`Order ${status} successfully!`, { id: toastId });
      navigate('/orders');
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = orderStatus !== 'draft';

  if (isAuthLoading || loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-gray-500">User not found. Redirecting...</div>;

  return (
    <>
      <Toaster />
      <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="content py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{order_id ? `Edit Order #${order_id}` : 'Create New Order'}</h1>
            <p className="text-gray-500 mt-1">Fill in the details below to create or edit an order.</p>
          </div>
          
          <form onSubmit={handleSubmit((data) => handleFormSubmit(data, 'draft'))}>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cột Trái: Thông tin người tạo */}
                    <div className="space-y-4">
                        <InfoField label="Username Admin" value={user.user_name} />
                        <InfoField label="Email" value={user.user_email} />
                        <InfoField label="Contact Number" value={user.phone} />
                        <InfoField label="Name Company" value={user.company_name} />
                        <InfoField label="Order Time" value={order_id && orderStatus !== 'draft' ? new Date(watch('created_at')).toLocaleString() : 'N/A'} />
                    </div>
                    {/* Cột Phải: Thông tin chính của Order */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="deal_id" className="block text-sm font-medium text-gray-700">Associated Deal</label>
                            <select id="deal_id" {...register('deal_id', { required: 'Please select a deal' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" disabled={isReadOnly || preSelectedDealId}>
                                <option value="">Select a deal</option>
                                {deals.map(deal => <option key={deal.deal_id} value={deal.deal_id}>{deal.customer_name}</option>)}
                            </select>
                            {errors.deal_id && <p className="text-red-500 text-xs mt-1">{errors.deal_id.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="order_title" className="block text-sm font-medium text-gray-700">Order Title</label>
                            <input id="order_title" type="text" {...register('order_title', { required: 'Order title is required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" disabled={isReadOnly} />
                            {errors.order_title && <p className="text-red-500 text-xs mt-1">{errors.order_title.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="order_description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="order_description" {...register('order_description')} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" disabled={isReadOnly} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BẢNG SẢN PHẨM --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Order Items</h3>
                    {!isReadOnly && (
                        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2" onClick={() => setIsDialogOpen(true)} disabled={!watchedDealId}>
                            <FiPlusCircle /> Add Item
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                {!isReadOnly && <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fields.length === 0 
                                ? (<tr><td colSpan={isReadOnly ? 5 : 6} className="text-center p-8 text-gray-500">No products added yet.</td></tr>) 
                                : (fields.map((field, index) => <OrderItemRow key={field.id} {...{ field, index, register, remove, watch, isReadOnly }} />))
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={isReadOnly ? 4 : 5} className="px-4 py-3 text-right font-bold text-gray-700">Total Budget</td>
                                <td className="px-4 py-3 text-lg font-bold text-gray-900">${Math.round(totalBudget).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            {!isReadOnly && (
                <div className="flex justify-end space-x-4 mt-6">
                    <button type="submit" disabled={isSubmitting || fields.length === 0} className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50">
                        <FiSave/> {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button type="button" onClick={handleSubmit(data => handleFormSubmit(data, 'submitted'))} disabled={isSubmitting || fields.length === 0} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">
                        <FiCheckSquare /> {isSubmitting ? 'Submitting...' : 'Submit Order'}
                    </button>
                </div>
            )}
          </form>

          <AddOrderDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleDialogSubmit}
            products={products}
            existingDetails={watchedDetails}
          />
        </div>
      </div>
    
    </>
  );
};

export default AddOrderPageRefactored;
