import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import { decodeToken } from '../../../utils/help';
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

const DealRow = ({ deal, index, navigate }) => {
  const statusStyles = {
    draft: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
      <td className="px-4 py-4 text-sm text-gray-900">#{deal.deal_id}</td>
      <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[150px]">{deal.user_email || '-'}</td>
      <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[150px]">{deal.user_name || '-'}</td>
      <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[150px]">{deal.customer_name || '-'}</td>
      <td className="px-4 py-4 text-sm text-gray-900 truncate max-w-[120px]">{deal.tax_indentification_number || '-'}</td>
      <td className="px-4 py-4 text-sm">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[deal.status] || statusStyles.default}`}>
          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1) || 'Unknown'}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">{new Date(deal.created_at).toLocaleDateString() || '-'}</td>
      <td className="px-4 py-4 text-sm text-gray-900 flex flex-wrap gap-2">
        <button
          className="text-yellow-600 hover:text-yellow-800 text-xs sm:text-sm touch-manipulation"
          onClick={() => navigate(`/manager/editdeals/${deal.deal_id}`)}
        >
          View
        </button>
      </td>
    </tr>
  );
};

const DealMana = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');
  const decodedToken = decodeToken(token);

  const loadDealsByUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/deals/get-deals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.status_code === 200) {
        const dealsData = result.data || [];
        // Fetch user data for each deal
        const enrichedDeals = await Promise.all(
          dealsData.map(async (deal) => {
            if (deal.user_id) {
              try {
                const userResponse = await fetch(`${BASE_URL}/users/get-user?user_id=${deal.user_id}`, {
                  headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    Authorization: `Bearer ${token}`,
                  },
                });
                const userResult = await userResponse.json();
                if (userResult.status_code === 200 && userResult.data) {
                  return {
                    ...deal,
                    user_name: userResult.data.user_name || '-',
                    user_email: userResult.data.user_email || '-',
                  };
                }
              } catch (userErr) {
                console.error(`Failed to fetch user for user_id ${deal.user_id}:`, userErr.message);
              }
            }
            return { ...deal, user_name: '-', user_email: '-' };
          })
        );
        setDeals(enrichedDeals);
      } else {
        throw new Error(result.message || 'Failed to load deals');
      }
    } catch (err) {
      setError(`Failed to load deals: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDealsByUser();
  }, [loadDealsByUser]);

  return (
    <div>
      <Header />
      <DashboardLayout activeMenu="08">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Deals Management</h1>
                <div className="text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / My Deals
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg p-4 shadow-md bg-white">
                <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuCoins className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-gray-800">{deals.length}</div>
                <div className="text-gray-500 text-sm">Total Deals</div>
              </div>
              <div className="rounded-lg p-4 shadow-md bg-white">
                <div className="bg-green-100 text-green-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuWalletMinimal className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {deals.filter((deal) => deal.status === 'approved').length}
                </div>
                <div className="text-gray-500 text-sm">Approved Deals</div>
              </div>
              <div className="rounded-lg p-4 shadow-md bg-white">
                <div className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <LuPersonStanding className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {deals.filter((deal) => deal.status === 'draft').length}
                </div>
                <div className="text-gray-500 text-sm">Draft Deals</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 gap-4">
                <h2 className="text-lg font-semibold text-gray-800">My Deals</h2>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-md touch-manipulation">
                    <LuArrowDownToLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md touch-manipulation">
                    <LuArrowUpNarrowWide className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md touch-manipulation"
                    onClick={loadDealsByUser}
                  >
                    <LuRefreshCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-0">
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-t border-red-400">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center px-4 py-4 font-medium text-sm text-blue-600 bg-white shadow rounded-lg">
                      Loading deals...
                    </div>
                  </div>
                )}

                {!loading && (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">No.</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Deal ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">TIN</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {deals.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                No deals found
                              </td>
                            </tr>
                          ) : (
                            deals.map((deal, index) => (
                              <DealRow
                                key={deal.deal_id}
                                deal={deal}
                                index={index}
                                navigate={navigate}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="block md:hidden divide-y divide-gray-200">
                      {deals.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No deals found</div>
                      ) : (
                        deals.map((deal, index) => (
                          <div key={deal.deal_id} className="p-4 bg-white hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-800">Deal #{deal.deal_id}</span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  deal.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : deal.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : deal.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {deal.status.charAt(0).toUpperCase() + deal.status.slice(1) || 'Unknown'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Email:</strong> {deal.user_email || '-'}</p>
                              <p><strong>Name:</strong> {deal.user_name || '-'}</p>
                              <p><strong>Customer:</strong> {deal.customer_name || '-'}</p>
                              <p><strong>TIN:</strong> {deal.tax_identification_number || '-'}</p>
                              <p><strong>Date:</strong> {new Date(deal.created_at).toLocaleDateString() || '-'}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                className="text-yellow-600 hover:text-yellow-800 text-sm touch-manipulation"
                                onClick={() => navigate(`/manager/editdeals/${deal.deal_id}`)}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">{deals.length}</span> of{' '}
                    <span className="font-medium">{deals.length}</span> results
                  </div>
                  <nav className="flex rounded-md shadow-sm -space-x-px">
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md touch-manipulation">
                      <LuChevronsLeft className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 touch-manipulation">
                      <LuChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                      1
                    </button>
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 touch-manipulation">
                      <LuChevronRight className="w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md touch-manipulation">
                      <LuChevronsRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default DealMana;