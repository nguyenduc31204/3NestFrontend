import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { BASE_URL } from '../../utils/apiPath';
import { fetchProductsByTypeAndRole } from '../../hook/fetchProduct';

const defaultValues = {
  details: [
    { product_id: '', quantity: '', price_for_customer: '', service_contract_duration: '' },
  ],
};

const AddOrderDialog = ({ open, onClose, onSubmit, activeRole  }) => {
  const { register, control, handleSubmit, reset } = useForm({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: 'details' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(1);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCategories, setIsCategories] = useState("");
  const [products, setProducts] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [isProducts, setIsProducts] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // Thêm state để lưu sản phẩm được chọn
  const { watch, setValue } = useForm();

  useEffect(() => {
      const fetchTypes = async () => {
          setLoading(true);
          setError(null);
          try {
              const url = `${BASE_URL}/types/get-types`;
              const response = await fetch(url, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'ngrok-skip-browser-warning': 'true'
                  },
              });

              const result = await response.json();
              if (!response.ok) {
                  throw new Error(response.message || `HTTP error! status: ${response.status}`);
              }

              setTypes(result.data);
          } catch (err) {
              console.error("API Error:", err);
              setError(err.message);
          } finally {
              setLoading(false);
          }
      };

      fetchTypes();
  }, []);

  useEffect(() => {
    if (selectedTypeId) {
      fetch(`${BASE_URL}/categories/get-categories-by-type?type_id=${selectedTypeId}`,{
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
        .then(res => res.json())
        .then(data => setCategories(data.data));
      setValue("category_id", ""); 
      setProducts([]);
      // Reset product selection khi thay đổi type
      setSelectedProduct(null);
      setIsProducts("");
      setIsCategories("");
    }
  }, [selectedTypeId]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const product = await fetchProductsByTypeAndRole({
        baseUrl: BASE_URL,
        typeId: selectedTypeId,
        role: activeRole,
        token,
      });
      setListProducts(product);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Failed to load products: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isCategories) {
      const filtered = listProducts.filter(
        (product1) => product1.category_name == (isCategories)
      );
      setProducts(filtered);
    } else {
      setProducts([]);
      // Reset product selection khi không có category
      setSelectedProduct(null);
      setIsProducts("");
    }
  }, [isCategories, listProducts]);

  // Hàm xử lý khi chọn sản phẩm
  const handleProductChange = (productId) => {
    setIsProducts(productId);
    
    // Tìm sản phẩm được chọn từ danh sách products
    const selected = products.find(product => product.product_id.toString() === productId);
    setSelectedProduct(selected);
  };

  const submitHandler = (data) => {
    onSubmit(data);
    reset();
    // Reset selected product khi submit
    setSelectedProduct(null);
    setIsProducts("");
  };

  const handleClose = () => {
    // Reset tất cả state khi đóng dialog
    setSelectedProduct(null);
    setIsProducts("");
    setIsCategories("");
    setSelectedTypeId(1);
    reset();
    onClose();
  };

  if (!open) return null; 

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()} 
      >
        <h2 className="text-xl font-semibold mb-4">Add New Item</h2>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Type</label>
              <select
                name="type_id"
                onChange={(e) => setSelectedTypeId(parseInt(e.target.value))}
                value={selectedTypeId}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              >
                {!selectedTypeId && (
                  <option value="" disabled hidden>
                    Select a type
                  </option>
                )}
                {types.map((type) => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Category</label>
              <select
                name="category_id"
                onChange={(e) => setIsCategories(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={isCategories}
              >
                  <option value="">
                    Select a category
                  </option>
                {categories.map((category) => (
                  <option key={category.category_name} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Product</label>
              <select
                name="products_id"
                onChange={(e) => handleProductChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={isProducts}
                disabled={!isCategories} 
              >
                <option value="">
                  Select a product
                </option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>
            
            
          </div>

          {/* Hiển thị thông tin chi tiết sản phẩm được chọn - chỉ hiển thị khi có category và product được chọn */}
          {selectedProduct && isCategories && (
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
                  <p className="text-gray-900">{selectedProduct.maximum_discount}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Discount Price:</span>
                  <p className="text-gray-900 text-orange-600">
                    ${selectedProduct.maximum_discount_price?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className={`font-medium ${selectedProduct.status ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.status ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{selectedProduct.description}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Details</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-5 gap-2 mb-2 items-end">
                <input
                  {...register(`details.${index}.product_id`)}
                  placeholder="Product ID"
                  className="border border-gray-300 rounded px-2 py-1"
                  value={selectedProduct ? selectedProduct.product_id : ''}
                  readOnly={!!selectedProduct}
                />
                <input
                  {...register(`details.${index}.quantity`)}
                  placeholder="Quantity"
                  type="number"
                  min="1"
                  className="border border-gray-300 rounded px-2 py-1"
                />
                <input
                  {...register(`details.${index}.price_for_customer`)}
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  className="border border-gray-300 rounded px-2 py-1"
                  defaultValue={selectedProduct ? selectedProduct.price : ''}
                />
                <input
                  {...register(`details.${index}.service_contract_duration`)}
                  placeholder="Contract Duration"
                  className="border border-gray-300 rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ 
                product_id: selectedProduct ? selectedProduct.product_id : '', 
                quantity: '', 
                price_for_customer: selectedProduct ? selectedProduct.price : '', 
                service_contract_duration: '' 
              })}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Detail
            </button>
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderDialog;