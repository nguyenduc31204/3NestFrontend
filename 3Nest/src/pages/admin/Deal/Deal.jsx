import React, { useEffect, useState, useMemo, use } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { hasPermission } from '../../../utils/permissionUtils';
import { BASE_URL } from '../../../utils/apiPath';


const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t">
      <span className="text-sm text-gray-700">
        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
      </span>
      <div className="flex items-center space-x-1">
        <IconButton title="First Page" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          <LuChevronsLeft />
        </IconButton>
        <IconButton title="Previous Page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <LuChevronLeft />
        </IconButton>
        <IconButton title="Next Page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <LuChevronRight />
        </IconButton>
        <IconButton title="Last Page" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          <LuChevronsRight />
        </IconButton>
      </div>
      
    </div>
  );
};



const StatCard = ({ Icon, value, label, color }) => (
  <div className="rounded-lg p-5 shadow-md bg-white flex items-center space-x-4">
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
    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
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
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{children}</td>
);

const RoleButton = ({ current, value, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      current === value 
        ? 'bg-white shadow text-blue-600 ring-1 ring-blue-200' 
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
);

const Alert = ({ msg }) => (
  <div className="p-4 my-4 mx-6 bg-red-50 border-l-4 border-red-400 text-red-700">
    <p><strong>Error:</strong> {msg}</p>
  </div>
);

const Loader = ({ msg }) => (
  <div className="p-8 text-center text-gray-500">{msg}</div>
);


const DealsPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [deals, setDeals] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeRoleId, setActiveRoleId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const token = useMemo(() => localStorage.getItem('access_token'), []);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);
      console.log('User loaded from localStorage:', user);


  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (hasPermission(user, 'deal:review')) {
          
          const rolesResponse = await fetch(`${BASE_URL}/roles/get-roles`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
          if (!rolesResponse.ok) throw new Error('Failed to fetch roles');
          const rolesResult = await rolesResponse.json();
          console.log('Roles fetched:', rolesResult);
          const availableRoles = rolesResult.data || [];
          setRoles(availableRoles);
          
          const adminRole = availableRoles.find(role => role.role_name.toLowerCase() === 'admin');

          const managerRole = availableRoles.find(role => role.role_name.toLowerCase() === 'manager');

          const defaultRole = adminRole || managerRole;
          
          if (!activeRoleId && defaultRole) {
            setActiveRoleId(defaultRole.role_id);
          }
          console.log('Available roles:', availableRoles);
          
          
          const roleIdToFetch = activeRoleId || adminRole?.role_id || managerRole?.role_id || user.role_id;
          console.log('Fetching deals for role ID:', roleIdToFetch);
          const dealsResponse = await fetch(`${BASE_URL}/deals/get-deals-by-role?role_id=${roleIdToFetch}`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
          // if (!dealsResponse.ok) throw new Error('Failed to fetch deals by role');
          const dealsResult = await dealsResponse.json();
          console.log('Deals by role1:', dealsResult);
          setDeals(dealsResult.data || []);

        } else {
          const dealsResponse = await fetch(`${BASE_URL}/deals/get-deals-by-user`, { headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' } });
          if (!dealsResponse.ok) throw new Error('Failed to fetch your deals');
          const dealsResult = await dealsResponse.json();
          console.log('Deals by role2:', dealsResult);
          setDeals(dealsResult.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeRoleId, token, refreshTrigger , navigate, roles.length]);

  const currentDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return deals.slice(startIndex, endIndex);
  }, [deals, currentPage]);
  const totalPages = useMemo(() => {
    return Math.ceil(deals.length / ITEMS_PER_PAGE);
  }, [deals]);

  const isDraft = 'draft';
  const isSubmitted = 'submitted';
  const isAccepted = 'approved';
  const isRejected = 'rejected';
  const isViewOnly = isAccepted || isRejected;

  const handleRoleChange = (roleId) => {
    setActiveRoleId(roleId);
    setCurrentPage(1); 
  };

  const handleRefresh = () => {
    setRefreshTrigger(c => c + 1);
    setCurrentPage(1);
  };

  if (!user) {
    return <Loader msg="Initializing..." />;
  }
  

  return (
    <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
      {/* <DashboardLayout activeMenu='08'> */}
        <div className="content py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Registration Management</h1>
              {/* <div className="text-sm text-gray-500">
                <a href="/deals" className="hover:underline">back</a>
              </div> */}
            </div>
            {hasPermission(user, 'deal:manage') && (
              <button
                className="bg-gray-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                onClick={() => navigate('/deals/add')}
              >
                + Add New Registration
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard Icon={LuCoins} value={deals.length} label="Total Registration" color="blue" />
            <StatCard Icon={LuWalletMinimal} value={deals.filter(d => d.status === 'approved').length} label="Approved Registration" color="green" />
            <StatCard Icon={LuPersonStanding} value={deals.filter(d => d.status === 'draft').length} label="Draft Registration" color="yellow" />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-wrap items-center justify-between p-4 border-b gap-4">
              <h2 className="text-lg font-semibold">Registration List</h2>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                {hasPermission(user, 'deal:review') && roles.map((role) => (
                  <RoleButton
                    key={role.role_id}
                    current={activeRoleId}
                    value={role.role_id}
                    onClick={setActiveRoleId}
                  >
                    {role.role_name}
                  </RoleButton>
                ))}
                <IconButton title="Export Excel"><LuArrowDownToLine className="w-5 h-5" /></IconButton>
                <IconButton title="Refresh" onClick={handleRefresh}><LuRefreshCcw className="w-5 h-5" /></IconButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              {error && <Alert msg={error} />}
              {loading ? <Loader msg="Loading deals..." /> : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <Th>Registration ID</Th>
                      <Th>Customer</Th>
                      <Th>TIN</Th>
                      <Th>Status</Th>
                      <Th>Created By</Th>
                      <Th>Date</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDeals.length === 0 ? (
                      <tr><td colSpan="7" className="text-center p-8 text-gray-500">No Registration found.</td></tr>
                    ) : (
                      currentDeals.map((deal) => (
                        <tr key={deal.deal_id} className="hover:bg-gray-50">
                          <Td>#{deal.deal_id}</Td>
                          <Td>{deal.customer_name}</Td>
                          <Td>{deal.tax_identification_number}</Td>
                          <Td>
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold capitalize rounded-full ${
                                (isAccepted === deal?.status) ? 'bg-green-100 text-green-800' :
                                (isRejected === deal?.status) ? 'bg-red-100 text-red-800' :
                                (isSubmitted === deal?.status) ? 'bg-blue-100 text-blue-800' :
                                (isDraft === deal?.status) ? 'bg-gray-200 text-gray-800' :
                                'bg-gray-100 text-gray-600' 
                              }`}
                            >
                              {deal?.status || 'N/A'}
                            </span>
                          </Td>
                          <Td>{deal.user_name || 'N/A'}</Td> 
                          <Td>{new Date(deal.created_at).toLocaleDateString()}</Td>
                          
                          {(hasPermission(user, 'deal:view') || hasPermission(user, 'deal:view')) && (
                            <Td>
                              {hasPermission(user, 'deal:view') && (
                                <button
                                  className="text-green-600 hover:underline font-medium"
                                  onClick={() => navigate(`/deals/edit/${deal.deal_id}`)}
                                >
                                  View
                                </button>
                              )}
                            </Td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {/* phân trang  */}
            <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages} 
            onPageChange={setCurrentPage}
          />
          </div>
        </div>
      {/* </DashboardLayout> */}
    </div>
  );
};

export default DealsPage;