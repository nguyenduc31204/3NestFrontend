import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray  } from 'react-hook-form';
import { BASE_URL } from '../../../utils/apiPath';
import { toast } from 'react-hot-toast'; 
import CurrencyPriceInput from '../../../components/forms/CurrencyPriceInput';

const formatCurrency = (amount, isVND, rate) => {
  if (typeof amount !== 'number') return 'N/A';
  
  const displayAmount = isVND ? amount * rate : amount;
  const currencySymbol = isVND ? 'VND' : 'USD';
  
  return `${displayAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currencySymbol}`;
};

const AddOrderDialog = ({
  open,
  onClose,
  onSubmit,
  order_title,
  customer_name,
  contact_name,
  contact_email,
  contact_phone,
  address,
  billing_address,
  existingDetails,
}) => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      details: existingDetails && existingDetails.length > 0 
                ? existingDetails 
                : []
    },
    mode: "onBlur" 
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'details' });

  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState(null); 
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVndDisplay, setIsVndDisplay] = useState(false); 
  const [usdToVndRate, setUsdToVndRate] = useState(25450);

  const toggleCurrencyDisplay = () => {
    setIsVndDisplay(!isVndDisplay);
  };


  useEffect(() => {
    const resetFormState = () => {
        reset({ details: [] });
        setSelectedTypeId('');
        setSelectedCategory('');
        setProducts([]);
        setSelectedProduct(null);
        setRequestError(null);
    };

    if (open) {
        resetFormState();
        fetchTypes();
    } else {
        resetFormState();
    }
  }, [open, reset]);

  const fetchTypes = async () => {
    setLoading(true);
    setRequestError(null);
    try {
      const response = await fetch(`${BASE_URL}/types/get-types`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch types');
      setTypes(result.data || []);
      if (result.data?.length > 0) {
        setSelectedTypeId(result.data[0].type_id.toString()); 
      } else {
        setSelectedTypeId('');
      }
    } catch (err) {
      setRequestError(`Failed to load types: ${err.message}`);
      toast.error(`Không thể tải loại: ${err.message}`); 
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!selectedTypeId) {
      setCategories([]);
      setSelectedCategory('');
      setProducts([]);
      setSelectedProduct(null);
      return;
    }
    const fetchCategories = async () => {
      setLoading(true);
      setRequestError(null);
      try {
        const response = await fetch(
          `${BASE_URL}/categories/get-categories-by-type?type_id=${selectedTypeId}`,
          { headers: { 'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
           } }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch categories');
        setCategories(result.data || []);
        setSelectedCategory(''); 
        setProducts([]);
        setSelectedProduct(null);
      } catch (err) {
        setRequestError(`Failed to load categories: ${err.message}`);
        toast.error(`Unable to load catalog: ${err.message}`); 
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedTypeId]);

  console.log("Selected Type ID:", selectedCategory);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      setSelectedProduct(null);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      setRequestError(null);
      try {
        const response = await fetch(
          `${BASE_URL}/products/get-products-by-category-and-role?category_id=${(selectedCategory)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const result = await response.json();
        console.log('result', result)
        if (result.status_code !== 200 || !Array.isArray(result.data)) {
          throw new Error(result.message || 'Invalid product data');
        }
        setProducts(result.data);
        setSelectedProduct(null); 
      } catch (err) {
        setRequestError(`Failed to load products: ${err.message}`);
        toast.error(`Unable to load product: ${err.message}`); 
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Thay thế hàm handleProductChange của bạn bằng hàm này để debug

const handleProductChange = (productId) => {
  console.log("--- BẮT ĐẦU DEBUG handleProductChange ---");
  console.log("1. Product ID được chọn từ dropdown:", productId);

  const product = products.find((p) => p.product_id?.toString() === productId);
  
  if (!product) {
    console.error("LỖI: Không tìm thấy sản phẩm tương ứng trong state `products`.");
    toast.error('Product data not found. Please refresh.'); 
    return;
  }
  console.log("2. Đã tìm thấy đối tượng sản phẩm đầy đủ:", product);

  setSelectedProduct(product || null); 
  setRequestError(null); 

  // In ra trạng thái của mảng `fields` TRƯỚC KHI tìm kiếm
  console.log("3. Trạng thái của `fields` trong form TRƯỚC KHI tìm:", fields);

  const existingDetailIndex = fields.findIndex((field) => {
    // Log ra giá trị đang được so sánh trong mỗi lần lặp
    console.log(`   -> Đang so sánh: field.product_id (${field.product_id}) VỚI product.product_id (${product.product_id})`);
    return field.product_id?.toString() === product.product_id?.toString();
  });

  console.log("4. Kết quả của findIndex (existingDetailIndex):", existingDetailIndex);

  if (existingDetailIndex >= 0) {
    console.log("5. KẾT LUẬN: ĐI VÀO LỆNH `update`. Sản phẩm được cho là đã tồn tại.");
    update(existingDetailIndex, {
      ...fields[existingDetailIndex],
      quantity: (parseInt(fields[existingDetailIndex].quantity) || 0) + 1,
    });
  } else {
    console.log("5. KẾT LUẬN: ĐI VÀO LỆNH `append`. Sản phẩm được cho là mới.");
    append({
      product_id: product.product_id,
      quantity: 1,
      price_for_customer: product.price || 0,
      channel_cost: product.channel_cost || 0,
      service_contract_duration: 1,
      product_name: product.product_name,
      // bạn có 2 product_name ở đây, tôi tạm bỏ bớt 1 cái
    });
  }
  console.log("--- KẾT THÚC DEBUG ---");
};


  const submitHandler = (data) => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please check the fields again."); 
      console.log("Form errors:", errors); 
      return; 
    }

    const submissionData = {
      order_title,
      customer_name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      billing_address,
      status: '', 
      details: data.details
        .filter((detail) => detail.product_id) 
        .map((detail) => {
          const productInfo = products.find(p => p.product_id?.toString() === detail.product_id?.toString());
          
          const isChannelProduct = localStorage.getItem('role') === 'channel';

          const submittedDetail = {
            product_id: parseInt(detail.product_id) || 0,
            quantity: parseInt(detail.quantity) || 0,
            service_contract_duration: parseInt(detail.service_contract_duration) || 0,
            // channel_cost: parseFloat(detail.channel_cost) || 0,
            // price_for_customer: parseFloat(detail.price_for_customer) || 0,
          };
          console.log('isChannelProduct', isChannelProduct)
          if (isChannelProduct) {
            submittedDetail.channel_cost = parseFloat(detail.channel_cost) || 0;
          } else {
            submittedDetail.price_for_customer = parseFloat(detail.price_for_customer) || 0;
          }

          return submittedDetail;
        }),
    };

    if (submissionData.details.length === 0) {
      setRequestError('At least one product is required.');
      toast.error('Please add at least one product to your order.'); 
      return;
    }

    onSubmit(submissionData);
    toast.success('Item added successfully!'); 
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

   const displayCurrencySymbol = isVndDisplay ? 'VND' : 'USD';
  
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >

      <div
        className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add Order Details</h2>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">Displaying Prices In: {displayCurrencySymbol}</span>
          <button
            type="button"
            onClick={toggleCurrencyDisplay}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {isVndDisplay ? 'Show in USD' : 'Show in VND'}
          </button>
        </div>

        {requestError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-sm text-red-700">
            {requestError}
          </div>
        )}

        {loading && <div className="mb-4 text-center text-blue-500">Loading...</div>}

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={loading}
              >
                <option value="" disabled>Select a type</option>
                {types.map((type) => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={loading || !selectedTypeId}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Product</label>
              <select
                value={selectedProduct?.product_id || ''}
                onChange={(e) => handleProductChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={loading || !selectedCategory || products.length === 0}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-3">Item Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Item Name:</span>
                  <p className="text-gray-900">{selectedProduct.product_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU/Part Number:</span>
                  <p className="text-gray-900">{selectedProduct.sku_partnumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">List Price:</span>
                  <p className="text-gray-900 font-semibold text-green-600">
                    {formatCurrency(selectedProduct.price, isVndDisplay, usdToVndRate)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Min Price (Max Discount):</span>
                  <p className="text-gray-900 text-orange-600">
                    {formatCurrency(selectedProduct.maximum_discount_price, isVndDisplay, usdToVndRate)}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{selectedProduct.description || 'No description available'}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Order Details</h3>
            {fields.length === 0 && (
                <p className="text-gray-500 text-sm mb-2">
                    Please select type, category and product to add to order.
                </p>
            )}
            {fields.map((field, index) => {
              const quantity = watch(`details.${index}.quantity`) || 1;
              // const priceForCustomerUSD = watch(`details.${index}.price_for_customer`) || 0;
              const years = Number(watch(`details.${index}.service_contract_duration`)) || 1;

              const productInfo = products.find((p) => p.product_id?.toString() === field.product_id?.toString());
              console.log('productInfo', productInfo)
              const isChannelProduct = localStorage.getItem('role') === 'channel';
              const upperLimitUSD = isChannelProduct 
              ? (productInfo?.channel_cost || 0) 
              : (productInfo?.price || 0);
              const lowerLimitUSD = isChannelProduct 
              ? (productInfo?.channel_lower_price || 0) 
              : (productInfo?.maximum_discount_price || 0);
              // const originalPriceUSD = productInfo?.price || 0;
              // const maxDiscountPriceUSD = productInfo?.maximum_discount_price || 0;
              const priceToCalculate = isChannelProduct 
              ? (watch(`details.${index}.channel_cost`) || 0)
              : (watch(`details.${index}.price_for_customer`) || 0);

              let totalUSD = 0;
              for (let i = 0; i < years; i++) {
                totalUSD += priceToCalculate  * Math.pow(1.05, i);
              }
              const subtotal = totalUSD * quantity;

              return (
                <div key={field.id} className="grid grid-cols-5 gap-2 mb-2 items-end p-4 border border-gray-200 rounded-lg shadow-sm">
                  <div>
                    <span className="font-medium text-gray-700">Product/Service</span>
                    <p className="text-gray-900">
                      {productInfo?.product_name || 'Unknown Product'}
                    </p>
                    <input
                      {...register(`details.${index}.product_id`, { required: 'Product ID is required' })}
                      type="hidden"
                      defaultValue={field.product_id}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Quantity</label>
                    <input
                      {...register(`details.${index}.quantity`, {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' },
                        valueAsNumber: true,
                      })}
                      type="number"
                      min="1"
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      defaultValue={field.quantity}
                    />
                    {errors.details?.[index]?.quantity && (
                      <p className="text-red-600 text-sm mt-1">{errors.details[index].quantity.message}</p>
                    )}
                  </div>
                  <div>
                    <CurrencyPriceInput
                      priceType={isChannelProduct ? 'channel' : 'sales'} 
                      control={control}
                      errors={errors}
                      index={index}
                      field={field}
                      isVndDisplay={isVndDisplay}
                      usdToVndRate={usdToVndRate}
                      formatCurrency={formatCurrency}
                      upperLimitUSD={upperLimitUSD} 
                      lowerLimitUSD={lowerLimitUSD} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium">Contract Duration</label>
                    <select
                      {...register(`details.${index}.service_contract_duration`, {
                        required: 'Contract duration is required',
                        valueAsNumber: true, 
                      })}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      defaultValue={field.service_contract_duration}
                    >
                      <option value="">Select duration</option>
                      <option value="1">1 year</option>
                      <option value="3">3 years</option>
                      <option value="5">5 years</option>
                    </select>
                    {errors.details?.[index]?.service_contract_duration && (
                      <p className="text-red-600 text-sm mt-1">{errors.details[index].service_contract_duration.message}</p>
                    )}
                  </div>
                  
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 rounded hover:bg-red-50 transition duration-200"
                    >
                      Clear
                    </button>
                  <div className="col-span-5 flex justify-end items-center mt-2 mr-4">
                    <p className="text-sm text-gray-900 font-bold">
                      Subtotal: {formatCurrency(subtotal, isVndDisplay, usdToVndRate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              disabled={loading || fields.length === 0}
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderDialog;