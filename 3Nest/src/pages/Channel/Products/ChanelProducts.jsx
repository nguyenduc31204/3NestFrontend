import React, { useEffect, useState } from 'react';
import {
  LuCoins,
  LuWalletMinimal,
  LuPersonStanding,
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw,
} from 'react-icons/lu';
import Header from '../../../components/layouts/Header';
import DasboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { decodeToken } from '../../../utils/help';
import { useNavigate } from 'react-router-dom'

const ChannelProducts = () => {
  const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState(1);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("access_token");
    const decode = decodeToken(token);
    const role = decode?.role || 'sales';
    const [activeRole, setActiveRole] = useState(role);

    useEffect(() => {
        const fetchTypes = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${BASE_URL}/types/get-types`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                });

                const contentType = response.headers.get('content-type');
                const responseBody = await response.text();

                if (contentType && contentType.includes('text/html')) {
                    throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
                }

                const result = JSON.parse(responseBody);

                if (!response.ok) {
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                }

                if (result.status_code === 200) {
                    if (Array.isArray(result.data)) {
                        setTypes(result.data);
                        if (result.data.length > 0) {
                            setSelectedTypeId(result.data[0].type_id);
                        }
                    } else {
                        throw new Error('Data field is not an array');
                    }
                } else {
                    throw new Error(result.message || "API request failed");
                }
            } catch (err) {
                console.error("API Error:", err);
                setError(err.message);

                if (err.message.includes('401')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();
    }, [navigate]);

    useEffect(() => {
        if (activeRole && selectedTypeId) {
            loadProductsByTypeAndRole(activeRole, selectedTypeId);
            
        }
        
    }, [activeRole, selectedTypeId]);

    const loadProductsByTypeAndRole = async (role, type_id) => {
        try {
            const url = `${BASE_URL}/products/get-products-by-role?role=${role}&type_id=${type_id}`;
            console.log("Fetching products from:", url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            

            const result = await response.json();
            console.log('Products API response:', result);
            ;



            if (result.status_code === 200 && Array.isArray(result.data)) {
                setProducts(result.data);
            } else {
                throw new Error(result.message || "Invalid product data format");
            }
        } catch (err) {
            console.error("API Error:", err);
            setError(`Failed to load products: ${err.message}`);
        }
        
    };

    const handleTypeChange = (e) => {
        setSelectedTypeId(parseInt(e.target.value));
    };

    const handleRefresh = () => {
        if (selectedTypeId && activeRole) {
            loadProductsByTypeAndRole(activeRole, selectedTypeId);
        }
    };


  return (
    <div>
      <Header />
      <DasboardLayout activeMenu="02">
        <div className="my-4 mx-auto max-w-screen-xl px-4">
          <div className="content py-6">
            <div className="page-header flex justify-between items-center mb-6">
              <div className="page-title">
                <h1 className="text-2xl font-semibold text-gray-800 mb-1">Channel Products</h1>
                <p className="text-sm text-gray-500">Dashboard / Channel Products</p>
              </div>
              <div className="tools flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded"><LuArrowDownToLine /></button>
                <button className="p-2 hover:bg-gray-100 rounded"><LuArrowUpNarrowWide /></button>
                <button className="p-2 hover:bg-gray-100 rounded" onClick={loadProductsByTypeAndRole}><LuRefreshCcw /></button>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Product Type</label>
              <select
                value={selectedTypeId}
                onChange={handleTypeChange}
                className="w-full md:w-64 border border-gray-300 rounded px-3 py-2 mt-1"
              >
                {types.map(type => (
                  <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                ))}
              </select>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
            {loading && <p>Loading...</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100 text-left text-xs uppercase font-semibold text-gray-600">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Part Number</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Channel Cost</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && products.map((product, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm">{product.product_name}</td>
                      <td className="p-3 text-sm">{product.category_name}</td>
                      <td className="p-3 text-sm">{product.sku_partnumber}</td>
                      <td className="p-3 text-sm">{product.price?.toLocaleString() || '-'}</td>
                      <td className="p-3 text-sm">{product.maximum_discount_price?.toLocaleString() || '-'}</td>
                      <td className="p-3 text-sm">{product.description || '-'}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && products.length === 0 && (
                    <tr><td colSpan="7" className="p-3 text-center text-gray-500">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DasboardLayout>
    </div>
  );
};

export default ChannelProducts;
