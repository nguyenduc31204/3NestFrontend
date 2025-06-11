import React, { useEffect, useState } from 'react';
import {
  LuCoins,
  LuWalletMinimal,
  LuPersonStanding,
  LuChevronsLeft,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsRight,
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw,
} from 'react-icons/lu';

import Header from '../../../components/layouts/Header';
import DasboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../../utils/help';
import ProductModal from './ProductModal';
import ProductDetail from './ProductDetail';


const Products = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');
  const decode = decodeToken(token);
  const role = decode?.role || localStorage.getItem('role');
  const [activeRole, setActiveRole] = useState(role === 'admin' ? 'admin' : role);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/types/get-types`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const contentType = res.headers.get('content-type');
        const bodyText = await res.text();
        if (contentType?.includes('text/html'))
          throw new Error(`Server returned HTML. Status: ${res.status}`);

        const result = JSON.parse(bodyText);
        if (!res.ok) throw new Error(result.message || `Status: ${res.status}`);

        if (result.status_code === 200) {
          setTypes(result.data);
          if (result.data.length) setSelectedTypeId(result.data[0].type_id);
        } else {
          throw new Error(result.message || 'API request failed');
        }
      } catch (err) {
        setError(err.message);
        if (err.message.includes('401')) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, [navigate]);
  
  useEffect(() => {
  fetch(`${BASE_URL}/categories/get-categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'ngrok-skip-browser-warning': 'true',
    },
  })
    .then(res => res.json())
    .then(result => {
      if (result.status_code === 200) {
        setCategories(result.data);    // ← bỏ hẳn ký tự “…” ở đây
      }
    })
    .catch(err => console.error(err));
}, []);


  useEffect(() => {
    if (selectedTypeId && activeRole) loadProductsByTypeAndRole(activeRole, selectedTypeId);
  }, [selectedTypeId, activeRole]);

  const loadProductsByTypeAndRole = async (roleParam, typeId) => {
    try {
      const url = `${BASE_URL}/products/get-products-by-role-and-type?role=${roleParam}&type_id=${typeId}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
          
        },
      });
      const result = await res.json();
      console.log('Products API Response:', result);
    //   if (result.status_code === 200 && Array.isArray(result.data)) {
        setProducts(result.data);
    //   } else {
    //     throw new Error(result.message || 'Invalid product data format');
    //   }
    } catch (err) {
      setError(`Failed to load products: ${err.message}`);
    }
  };
console.log('Products:', products);
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${BASE_URL}/products/delete-product?product_id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',

        },
      });
      if (res.status === 204 || res.ok) {
        handleRefresh();
        return;
      }
      const result = await res.json();
      if (result.status_code === 200) {
        handleRefresh();
      } else {
        alert(result.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
      console.error(err);
    }
  };

  const handleRefresh = () => loadProductsByTypeAndRole(activeRole, selectedTypeId);
  const handleRoleChange = (newRole) => role === 'admin' && setActiveRole(newRole);
  const handleTypeChange = (e) => setSelectedTypeId(e.target.value);


  const openDetail = (product) => {
    setDetailProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div>
      <Header />
      <DasboardLayout activeMenu="02">
        <div className="my-5 mx-auto">
          <div className="content p-6 sm:p-10">
            {/* Page header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Dashboard Management</h1>
                <div className="text-gray-500 text-sm">
                  <a href="#" className="hover:underline">Dashboard</a> / Products
                </div>
              </div>
              {role === 'admin' && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                  onClick={() => {
                    setEditingProduct(null);
                    setModalKey((prev) => prev + 1);
                    setIsModalOpen(true);
                  }}
                >
                  + Add new product
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard Icon={LuCoins} value={products.length} label="Total Products" color="blue" />
              <StatCard Icon={LuWalletMinimal} value={products.filter((p) => p.status).length} label="Active Products" color="green" />
              <StatCard Icon={LuPersonStanding} value={products.filter((p) => !p.status).length} label="Inactive Products" color="yellow" />
            </div>

            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
          
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Products & Services</h2>
                <div className="flex space-x-2">
                  <IconButton title="Export Excel"><LuArrowDownToLine className="w-5 h-5" /></IconButton>
                  <IconButton title="Filter"><LuArrowUpNarrowWide className="w-5 h-5" /></IconButton>
                  <IconButton title="Refresh" onClick={handleRefresh}><LuRefreshCcw className="w-5 h-5" /></IconButton>
                </div>
              </div>

            
              <div className="p-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Type</label>
                  <select
                    value={selectedTypeId}
                    onChange={handleTypeChange}
                    className="w-48 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {types.map((t) => (
                      <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
                    ))}
                  </select>
                </div>

                {role === 'admin' && (
                  <div className="flex items-end space-x-2">
                    <RoleButton current={activeRole} value="admin" onClick={handleRoleChange}>Admin</RoleButton>
                    <RoleButton current={activeRole} value="sales" onClick={handleRoleChange}>Sales</RoleButton>
                    <RoleButton current={activeRole} value="channel" onClick={handleRoleChange}>Channels</RoleButton>
                  </div>
                )}
              </div>

              {error && <Alert msg={error} />}
              {loading && <Loader msg="Loading products..." />}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>#</Th>
                      <Th>Product Name</Th>
                      <Th>Category Name</Th>
                      <Th>Part Number</Th>
                      <Th>Price</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {!loading && products.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No products found</td>
                      </tr>
                    )}
                    {products.map((product, idx) => (
                      <tr key={product.product_id || idx} className="hover:bg-gray-50">
                        <Td>{idx + 1}</Td>
                        <Td>{product.product_name || '-'}</Td>
                        <Td>{product.category_name || '-'}</Td>
                        <Td>{product.sku_partnumber || '-'}</Td>
                        <Td>{product.price ? parseFloat(product.price).toLocaleString() : '-'}</Td>
                        <Td>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.status ? 'Active' : 'Inactive'}
                          </span>
                        </Td>
                        <Td>
                          <button className="text-blue-600 hover:underline mr-2" onClick={() => openDetail(product)}>Detail</button>
                          {role === 'admin' && (
                            <>
                              <button className="text-indigo-600 hover:underline mr-2" onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>Edit</button>
                              <button className="text-red-600 hover:underline" onClick={() => handleDelete(product.product_id)}>Delete</button>
                            </>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simple pagination placeholder (static) */}
              <div className="flex items-center justify-between p-4 border-t text-sm text-gray-500 bg-gray-50">
                Showing 1‑{products.length} of {products.length} results
                <div className="flex space-x-1">
                  <PaginationButton><LuChevronsLeft className="w-4 h-4" /></PaginationButton>
                  <PaginationButton><LuChevronLeft className="w-4 h-4" /></PaginationButton>
                  <PaginationButton active>1</PaginationButton>
                  <PaginationButton><LuChevronRight className="w-4 h-4" /></PaginationButton>
                  <PaginationButton><LuChevronsRight className="w-4 h-4" /></PaginationButton>
                </div>
              </div>
            </div>
          </div>
        </div>


        <ProductModal
          key={modalKey}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleRefresh}
          product={editingProduct}
          types={types}
        />

        <ProductDetail
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            product={detailProduct}
            categories={categories}   
            />
      </DasboardLayout>
    </div>
  );
};

const StatCard = ({ Icon, value, label, color }) => (
  <div className="rounded-md p-5 shadow bg-white flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  </div>
);

const IconButton = ({ children, title, onClick }) => (
  <button
    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
    title={title}
    onClick={onClick}
  >
    {children}
  </button>
);

const Th = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>
);
const Td = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-gray-900">{children}</td>
);
const RoleButton = ({ current, value, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${current === value ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
);
const PaginationButton = ({ children, active, onClick }) => (
  <button
    className={`px-3 py-1 border border-gray-300 ${active ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded`}
    onClick={onClick}
  >
    {children}
  </button>
);
const Alert = ({ msg }) => (
  <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{msg}</div>
);
const Loader = ({ msg }) => (
  <div className="p-8 text-center text-blue-500">{msg}</div>
);

export default Products;
