
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosIntance';
import DasboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import {
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw,
} from "react-icons/lu";
import ProductModal from './ProductModal';

const ProductDetail = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [types, setTypes] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/products/get-products');
      setProducts(res.data?.data || []);
    } catch (err) {
      setError('Cannot load product list');
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await axiosInstance.get('/types/get-types');
      setTypes(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch types');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this product?')) return;
    try {
      await axiosInstance.delete(`/products/delete-product?product_id=${id}`);
      fetchProducts();
    } catch (err) {
      alert('Delete failed!');
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchProducts();
  }, []);

  return (
    <div>
      <Header />
      <DasboardLayout activeMenu="product">
        <div className="my-5 mx-auto">
          <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
              <div className="page-title">
                <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Product Management</h1>
                <div className="breadcrumb text-gray-500 text-sm">
                  <a href="#" className='text-gray-500'>Dashboard</a> / Product
                </div>
              </div>
              <div className="action-buttons mb-2">
                <button
                  onClick={() => { setEditingProduct(null); setModalOpen(true); }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  + Add Product
                </button>
              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-header flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Products</h2>
                <div className="tools flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md" title="Export Excel">
                    <LuArrowDownToLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md" title="Filter">
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md" title="Refresh" onClick={fetchProducts}>
                    <LuRefreshCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="card-body p-0">
                {error && <div className="p-4 bg-red-50 text-red-700">{error}</div>}

                {loading ? (
                  <div className="p-8 text-center text-blue-600">Loading products...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                          <tr key={product.product_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm">{index + 1}</td>
                            <td className="px-6 py-4 text-sm">{product.product_name}</td>
                            <td className="px-6 py-4 text-sm">{product.category_name}</td>
                            <td className="px-6 py-4 text-sm">{product.sku_partnumber}</td>
                            <td className="px-6 py-4 text-sm">{product.price}</td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button onClick={() => { setEditingProduct(product); setModalOpen(true); }} className='text-blue-600'>Edit</button>
                              <button onClick={() => handleDelete(product.product_id)} className='text-red-600'>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ProductModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={editingProduct}
          onSave={fetchProducts}
          types={types}
        />
      </DasboardLayout>
    </div>
  );
};

export default ProductDetail;
