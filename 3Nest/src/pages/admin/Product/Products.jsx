import React, { useEffect, useState } from 'react';

import { FiEdit, FiTrash } from 'react-icons/fi';
import {
  LuCoins, LuWalletMinimal, LuPersonStanding,
  LuChevronsLeft, LuChevronLeft, LuChevronRight, LuChevronsRight,
  LuArrowDownToLine, LuArrowUpNarrowWide, LuRefreshCcw
} from 'react-icons/lu';




import Header from '../../../components/layouts/Header';

import { BASE_URL } from '../../../utils/apiPath';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../../utils/help';
import ProductModal from './ProductModal';
import ProductDetail from './ProductDetail';

import { hasPermission } from '../../../utils/permissionUtils';



const Products = () => {
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);

  const [roles, setRoles] = useState([]);

  const [selectedTypeId, setSelectedTypeId] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeRoleId, setActiveRoleId] = useState(null);

  const token = localStorage.getItem('access_token');
  const decode = decodeToken(token);
  const currentRoleName = decode?.role || localStorage.getItem('role');
  const permissions = decode?.permissions || [];


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const [user, setUser] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/types/get-types`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await res.json();
        if (res.ok && result.status_code === 200) {
          setTypes(result.data);
          if (result.data.length) setSelectedTypeId(result.data[0].type_id);
        } else {
          throw new Error(result.message || 'Failed to fetch types');

        }
      } catch (err) {
        setError(err.message);
        if (err.message.includes('401')) navigate('/login');
      } finally {
        setLoading(false);
      }
    };


    const fetchRoles = async () => {
      try {
        const res = await fetch(`${BASE_URL}/roles/get-roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const result = await res.json();
        if (res.ok && result.status_code === 200) {
          setRoles(result.data);
          const matchedRole = result.data.find(r => r.role_name === currentRoleName);
          if (matchedRole) setActiveRoleId(matchedRole.role_id);
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };

    fetchTypes();
    fetchRoles();
  }, [navigate, token, currentRoleName]);

  useEffect(() => {
    fetch(`${BASE_URL}/categories/get-categories`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then(res => res.json())
      .then(result => {
        if (result.status_code === 200) {
          setCategories(result.data);
        }
      })
      .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
  if (!activeRoleId || !selectedTypeId || !user) return;

  if (canManage) {
    loadProductsByTypeAndRole(activeRoleId, selectedTypeId);
  } else if (canView) {
    loadProductsByRole(activeRoleId);
  }
}, [activeRoleId, selectedTypeId, currentRoleName, user]);



  const loadProductsByTypeAndRole = async (roleId, typeId) => {
    try {
      const url = `${BASE_URL}/products/get-products-by-role-and-type?role_id=${roleId}&type_id=${typeId}`;
      //console.log("Fetching products with URL:", url);
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const result = await res.json();
      if (res.ok && result.status_code === 200) {
        setProducts(result.data || []);
      } else {
        setError(result.message || 'Failed to load products');
      }
    } catch (err) {
      setError(`Failed to load products: ${err.message}`);
    }
  };

  const loadProductsByRole = async (roleId) => {
    try {
      const url = `${BASE_URL}/products/get-products-by-role?role_id=${roleId}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const result = await res.json();
      if (res.ok && result.status_code === 200) {
        setProducts(result.data || []);
      } else {
        setError(result.message || 'Failed to load products');
      }
    } catch (err) {
      setError(`Failed to load products: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${BASE_URL}/products/delete-product?product_id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (res.ok) {
        handleRefresh();
      } else {
        const result = await res.json();
        alert(result.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
      console.error(err);
    }
  };

  const handleRefresh = () => {
  if (canManage) {
    loadProductsByTypeAndRole(activeRoleId, selectedTypeId);
  } else if (canView) {
    loadProductsByRole(activeRoleId);
  }
};



  const handleRoleChange = (newRoleId) => setActiveRoleId(newRoleId);
  const handleTypeChange = (e) => setSelectedTypeId(e.target.value);
  const openDetail = (product) => {
    setDetailProduct(product);
    setIsDetailOpen(true);
  };

  const canFullControl = user && hasPermission(user, 'product:full-control');
  const canManage = user && (hasPermission(user, 'product:manage') || canFullControl || currentRoleName === 'admin');
  const canView = user && (hasPermission(user, 'product:view') || canManage);

  if (!user) return <div className="p-8 text-center">Initializing…</div>;

  if (!canView) {
    return <div className="p-8 text-center text-red-600">Do not have permission accessing this page</div>;
  }
  const sortedProducts = [...products].sort((a, b) => {
    const nameA = a.product_name?.toLowerCase() || '';
    const nameB = b.product_name?.toLowerCase() || '';
    if (nameA < nameB) return sortAsc ? -1 : 1;
    if (nameA > nameB) return sortAsc ? 1 : -1;
    return 0;
  });

  function wrapTextByWords(text, maxLength = 50) {
    if (!text) return ['-'];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);

    return lines;
  }
  

  return (
    <div>
      
      <div className="my-5 mx-auto">
        <div className="content p-6 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-1">Item Management</h1>
              
            </div>
            {canManage && (
              <button
                className="bg-gray-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                onClick={() => {
                  setEditingProduct(null);
                  setModalKey(prev => prev + 1);
                  setIsModalOpen(true);
                }}
              >
                + Add New Item
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard Icon={LuCoins} value={products.length} label="Total Items" color="blue" />
            <StatCard Icon={LuWalletMinimal} value={products.filter(p => p.status).length} label="Active Items" color="green" />
            <StatCard Icon={LuPersonStanding} value={products.filter(p => !p.status).length} label="Inactive Items" color="yellow" />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Table Item</h2>
              <div className="flex space-x-2">
                {/* <IconButton title="Export Excel"><LuArrowDownToLine className="w-5 h-5" /></IconButton>
                <IconButton title="Filter"><LuArrowUpNarrowWide className="w-5 h-5" /></IconButton> */}
                {/* <IconButton title="Refresh" onClick={handleRefresh}><LuRefreshCcw className="w-5 h-5" /></IconButton> */}
                <IconButton
                  title={`Sort ${sortAsc ? 'A → Z' : 'Z → A'}`}
                  onClick={() => setSortAsc(prev => !prev)}
                >
                  <LuArrowUpNarrowWide className="w-5 h-5" />
                </IconButton>

              </div>
            </div>

            {hasPermission(user, 'role:manage') && (
            <div className="p-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
              
              <div>
                <label className="block text-sm font-medium mb-1">Item Type</label>
                <select
                  value={selectedTypeId}
                  onChange={handleTypeChange}
                  className="w-48 border border-gray-300 rounded-md px-3 py-2"
                >
                  {types.map((t) => (
                    <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
                  ))}
                </select>
              </div>
              
              
                <div className="flex items-end space-x-2">
                  {roles.map((r) => (
                    <RoleButton
                      key={r.role_id}
                      current={activeRoleId}
                      value={r.role_id}
                      onClick={handleRoleChange}
                    >
                      {r.role_name.charAt(0).toUpperCase() + r.role_name.slice(1)}
                    </RoleButton>
                  ))}
                </div>
              
            </div>
            )}

            {error && <Alert msg={error} />}
            {/* {loading && <Loader msg="Loading products..." />} */}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>#</Th>
                    <Th>Item Name</Th>
                    <Th>Category Name</Th>
                    <Th>Part Number</Th>
                    <Th>Description</Th>
                    {['admin', 'manager'].includes(currentRoleName) && <Th>Original Cost</Th>}
                    <Th>Price</Th>
                    {currentRoleName === 'channel' && <Th>Channel Cost</Th>}
                    {currentRoleName === 'sales' && <Th>Max Discount Price</Th>}
                    <Th>Status</Th>
                    {canManage && (
                    <Th>Action</Th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {!loading && products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No item found</td>
                    </tr>
                  )}
                  
                  {sortedProducts.map((product, idx) => {
                      const discountPrice = product.maximum_discount
                        ? product.price * (1 - product.maximum_discount / 100)
                        : null;

                      return (
                        <tr key={product.product_id || idx} className="hover:bg-gray-50">
                          <Td>{idx + 1}</Td>
                          <Td>{product.product_name || '-'}</Td>
                          <Td>{product.category_name || '-'}</Td>
                          <Td>{product.sku_partnumber || '-'}</Td>
                          <Td className="break-words whitespace-normal break-words max-w-[220px]">
                            {wrapTextByWords(product.description || product.product_description || '-', 75).map((line, index) => (
                              <div key={index}>{line}</div>
                            ))}
                          </Td>
                          {['admin', 'manager'].includes(currentRoleName) && (
                            <Td>{product.original_cost ? parseFloat(product.original_cost).toLocaleString() : '-'}</Td>
                          )}

                          <Td>{product.price ? parseFloat(product.price).toLocaleString() : '-'}</Td>

                          {currentRoleName === 'channel' && (
                            <Td>{product.channel_cost ? parseFloat(product.channel_cost).toLocaleString() : '-'}</Td>
                          )}

                          {currentRoleName === 'sales' && (
                            <Td>{discountPrice ? discountPrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}</Td>
                          )}

                          <Td>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                          </Td>

                          <Td>
                            {canManage && (
                              <div className="flex items-center gap-4">
                                <button
                                  className="text-blue-600 hover:text-blue-800 mr-2"
                                  onClick={() => openDetail(product)}
                                  title="View Details"
                                >
                                  Detail
                                </button>

                                <button
                                  className="text-indigo-600 hover:text-indigo-800 mr-2"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsModalOpen(true);
                                  }}
                                  title="Edit"
                                >
                                  <FiEdit className="w-5 h-5" />
                                </button>

                                <button
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDelete(product.product_id)}
                                  title="Delete"
                                >
                                  <FiTrash className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </Td>
                        </tr>
                      );
                    })}

                </tbody>
              </table>
            </div>
            {loading && <Loader msg="Loading items..." />}
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
        roles={roles}
      />

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

    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"

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

const Alert = ({ msg }) => (
  <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{msg}</div>
);
const Loader = ({ msg }) => (
  <div className="p-8 text-center text-blue-500">{msg}</div>
);

export default Products;
