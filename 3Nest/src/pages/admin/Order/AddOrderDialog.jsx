import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { BASE_URL } from '../../../utils/apiPath';

const AddOrderDialog = ({
  open,
  onClose,
  onSubmit,
  order_title,
  customer_name,
  address,
  billing_address,
  existingDetails,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      details: existingDetails || [],
    },
  });
  const { fields, append, remove, update } = useFieldArray({ control, name: 'details' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/types/get-types`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch types');
        setTypes(result.data || []);
        if (result.data?.length > 0) setSelectedTypeId(result.data[0].type_id);
      } catch (err) {
        setError(`Failed to load types: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!selectedTypeId) return;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/categories/get-categories-by-type?type_id=${selectedTypeId}`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch categories');
        setCategories(result.data || []);
        setSelectedCategory('');
        setProducts([]);
        setSelectedProduct(null);
      } catch (err) {
        setError(`Failed to load categories: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedTypeId]);

  useEffect(() => {
    if (!selectedCategory) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/products/get-products-by-role?category_name=${encodeURIComponent(selectedCategory)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              'ngrok-skip-browser-warning': 'true',
            },
          }
        );
        const result = await response.json();
        if (result.status_code !== 200 || !Array.isArray(result.data)) {
          throw new Error(result.message || 'Invalid product data');
        }
        setProducts(result.data);
        setSelectedProduct(null);
      } catch (err) {
        setError(`Failed to load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const handleProductChange = (productId) => {
    const product = products.find((p) => p.product_id.toString() === productId);
    setSelectedProduct(product || null);

    if (!product) {
      setError('Please select a valid product.');
      return;
    }

    const existingDetailIndex = fields.findIndex(
      (field) => field.product_id.toString() === product.product_id.toString()
    );

    if (existingDetailIndex >= 0) {
      update(existingDetailIndex, {
        ...fields[existingDetailIndex],
        quantity: (parseInt(fields[existingDetailIndex].quantity) || 0) + 1,
      });
    } else {
      append({
        product_id: product.product_id,
        quantity: 1,
        price_for_customer: product.price || 0,
        service_contract_duration: 0,
      });
    }
  };

  const submitHandler = (data) => {
    const submissionData = {
      order_title,
      customer_name,
      address,
      billing_address,
      status: 'draft',
      details: data.details
        .filter((detail) => detail.product_id)
        .map((detail) => ({
          product_id: parseInt(detail.product_id) || 0,
          quantity: parseInt(detail.quantity) || 0,
          price_for_customer: parseFloat(detail.price_for_customer) || 0,
          service_contract_duration: parseInt(detail.service_contract_duration) || 0,
        })),
    };

    if (submissionData.details.length === 0) {
      setError('At least one product is required.');
      return;
    }

    onSubmit(submissionData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTypeId('');
    setSelectedCategory('');
    setProducts([]);
    setSelectedProduct(null);
    reset({ details: existingDetails || [] });
    setError(null);
    onClose();
  };

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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-sm text-red-700">
            {error}
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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                disabled={loading || !selectedTypeId}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_name}>
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
                disabled={loading || !selectedCategory}
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
              <h3 className="font-semibold text-blue-800 mb-3">Product Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Product Name:</span>
                  <p className="text-gray-900">{selectedProduct.product_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU/Part Number:</span>
                  <p className="text-gray-900">{selectedProduct.sku_partnumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Price:</span>
                  <p className="text-gray-900 font-semibold text-green-600">
                    ${selectedProduct.price?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Discount:</span>
                  <p className="text-gray-900">{selectedProduct.maximum_discount || 0}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Discount Price:</span>
                  <p className="text-gray-900 text-orange-600">
                    ${selectedProduct.maximum_discount_price?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{selectedProduct.desciption || 'No description available'}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Order Details</h3>
            {fields.length === 0 && <p className="text-gray-500 text-sm mb-2">No products added yet.</p>}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-5 gap-2 mb-2 items-end">
                <div>
                  <span className="font-medium text-gray-700">Product:</span>
                  <p className="text-gray-900">
                    {products.find((p) => p.product_id.toString() === field.product_id.toString())?.product_name ||
                      'Unknown'}
                  </p>
                  <input
                    {...register(`details.${index}.product_id`, { required: 'Product ID is required' })}
                    type="hidden"
                    value={field.product_id}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Quantity</label>
                  <input
                    {...register(`details.${index}.quantity`, {
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' },
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
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    {...register(`details.${index}.price_for_customer`, {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price cannot be negative' },
                    })}
                    type="number"
                    step="0.01"
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                    defaultValue={field.price_for_customer}
                  />
                  {errors.details?.[index]?.price_for_customer && (
                    <p className="text-red-600 text-sm mt-1">{errors.details[index].price_for_customer.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Contract Duration</label>
                  <select
                    {...register(`details.${index}.service_contract_duration`, {
                      required: 'Contract duration is required',
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
                  className="text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
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
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderDialog;
