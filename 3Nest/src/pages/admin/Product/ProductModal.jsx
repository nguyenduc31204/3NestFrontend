import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../../utils/apiPath';

const formatNumber = (v) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');


const ProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    product_role: 'admin',
    category_id: '',
    sku_partnumber: '',
    description: '',
    price: '',
    maximum_discount: '',
    channel_cost: '',
  });
  const [categories, setCategories] = useState([]);
  const [discountErr, setDiscountErr] = useState('');

  const isFieldEnabled = (field) => {
    const role = formData.product_role;
    if (field === 'price') return true;
    const enabledFields = {
      admin: [],
      sales: ['maximum_discount'],
      channel: ['channel_cost'],
    };
    return enabledFields[role]?.includes(field);
  };

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/categories/get-categories`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const result = await res.json();
      if (result.status_code === 200) setCategories(result.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length === 0) return;

    if (product) {
      setFormData({
        ...product,
        category_id: product.category_id?.toString() || '',
        price: product.price ? String(product.price) : '',
        maximum_discount: product.maximum_discount ? String(product.maximum_discount) : '',
        channel_cost: product.channel_cost ? String(product.channel_cost) : '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        category_id: categories[0]?.category_id?.toString() || '',
      }));
    }
  }, [product, categories]);

  const handleNumberChange = (name, raw) => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') {
      setFormData((p) => ({ ...p, [name]: '' }));
      if (name === 'maximum_discount') setDiscountErr('');
      return;
    }

    const num = Number(digits);
    if (name === 'maximum_discount') {
      if (num > 100) {
        setDiscountErr('Discount must be in 0‑100');
        return;
      }
      setDiscountErr('');
    }

    if (['price', 'channel_cost'].includes(name) && num === 0) return;

    setFormData((p) => ({ ...p, [name]: String(num) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['price', 'maximum_discount', 'channel_cost'].includes(name)) {
      handleNumberChange(name, value);
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFieldEnabled('price') && Number(formData.price) <= 0) {
      alert('Price phải > 0');
      return;
    }

    if (isFieldEnabled('channel_cost') && Number(formData.channel_cost) <= 0) {
      alert('Channel cost phải > 0');
      return;
    }

    const discountNum = Number(formData.maximum_discount || 0);
    if (
      isFieldEnabled('maximum_discount') &&
      (discountNum < 0 || discountNum > 100)
    ) {
      alert('Discount must be in 0‑100');
      return;
    }

    const cleaned = {
      ...(product ? { product_id: product.product_id } : {}),
      product_name: formData.product_name,
      product_role: formData.product_role,
      category_id: parseInt(formData.category_id, 10),
      sku_partnumber: formData.sku_partnumber,
      description: formData.description,
      price: formData.price !== '' ? Number(formData.price) : 0,
      maximum_discount: formData.maximum_discount !== ''
        ? Number(formData.maximum_discount)
        : 0,
      channel_cost: formData.channel_cost !== ''
        ? Number(formData.channel_cost)
        : 0,
    };

    const endpoint = product ? '/products/update-product' : '/products/create-product';

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(cleaned),
      });

      const result = await res.json();
      if ([200, 201].includes(result.status_code)) {
        onSave();
        onClose();
      } else {
    console.error('Error response:', result); 
    if (result.message?.toLowerCase().includes('product') && result.message?.toLowerCase().includes('exist')) {
      alert('Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác.');
    } else {
      alert(result.message || 'Failed to save product');
    }
  }
    } catch {
      alert('Error saving product');
    }
  };
  console.log('category_id:', formData.category_id, 'typeof:', typeof formData.category_id);
  console.log('categories:', categories);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">
          {product ? 'Edit' : 'Add'} Product
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            name="product_name"
            placeholder="Product Name"
            value={formData.product_name}
            onChange={handleChange}
            className="border p-2"
            required
          />

          <select
            name="product_role"
            value={formData.product_role}
            onChange={handleChange}
            className="border p-2"
            required
          >
            {['admin', 'sales', 'channel'].map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>

          <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="border p-2"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id.toString()}>
              {cat.category_name}
            </option>
          ))}
        </select>


          <input
            name="sku_partnumber"
            placeholder="SKU/Part Number"
            value={formData.sku_partnumber}
            onChange={handleChange}
            className="border p-2"
          />
          <div className="relative col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              name="price"
              placeholder="0"
              inputMode="numeric"
              min="1"
              value={formData.price === '' ? '' : formatNumber(formData.price)}
              onChange={handleChange}
              disabled={!isFieldEnabled('price')}
              required={isFieldEnabled('price')}
              className={`border p-2 pl-6 w-full ${
                isFieldEnabled('price') ? 'font-semibold text-black' : 'text-gray-400 bg-gray-100'
              }`}
            />
          </div>

          <div className="col-span-1">
            <input
              name="maximum_discount"
              placeholder="Discount % (0-100)"
              inputMode="numeric"
              min="0"
              max="100"
              value={formData.maximum_discount}
              onChange={handleChange}
              disabled={!isFieldEnabled('maximum_discount')}
              required={isFieldEnabled('maximum_discount')}
              className={`border p-2 w-full ${
                isFieldEnabled('maximum_discount') ? 'font-semibold text-black' : 'text-gray-400 bg-gray-100'
              }`}
            />
            {discountErr && (
              <p className="text-red-600 text-xs mt-1">{discountErr}</p>
            )}
          </div>

          <div className="relative col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              name="channel_cost"
              placeholder="Channel Cost"
              inputMode="numeric"
              min="1"
              value={formData.channel_cost === '' ? '' : formatNumber(formData.channel_cost)}
              onChange={handleChange}
              disabled={!isFieldEnabled('channel_cost')}
              required={isFieldEnabled('channel_cost')}
              className={`border p-2 pl-6 w-full ${
                isFieldEnabled('channel_cost') ? 'font-semibold text-black' : 'text-gray-400 bg-gray-100'
              }`}
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 col-span-2"
          />

          <div className="col-span-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
