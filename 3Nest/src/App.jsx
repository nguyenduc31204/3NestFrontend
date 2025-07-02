import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Products from './pages/admin/Product/Products'
import Categories from './pages/admin/Category/Categories'
import Orders from './pages/admin/Order/Orders'
import Reports from './pages/admin/Reports'
import Logout from './pages/admin/Logout'
import Users from './pages/admin/User/Users'
import AddOrder from './pages/admin/Order/AddOder'
import AddType from './pages/admin/Type/AddType'
import EditType from './pages/admin/Type/EditType'

import AddUser from './pages/admin/User/AddUser';
import EditUser from './pages/admin/User/EditUser';
import UserDetail from './pages/admin/User/UserDetail';


import ForgotPassword from './pages/Auth/ForgotPassword'

import TypeDetail from './pages/admin/Type/TypeDetail';


import DealAdmin from './pages/admin/Deal/Deal'
import EditOrderAdmin from './pages/admin/Order/EditOrder'
import PermissionTypePage from './pages/admin/PermissionType'
import { Toaster } from 'react-hot-toast'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ProtectedRoute from './pages/Auth/ProtectedRoute'
import Header from './components/layouts/Header'
import DashboardLayout from './components/layouts/DashboardLayout'
import EditDealPage from './pages/admin/Deal/Edit'
import AddDealAdmin from './pages/admin/Deal/AddDeal'
import { AuthProvider } from './context/AuthContext'
import RoleList from './pages/admin/Role/RoleList';
import AddRole from './pages/admin/Role/AddRole';
import EditRole from './pages/admin/Role/EditRole';
import RoleDetail from './pages/admin/Role/RoleDetail';
import Profile from './pages/admin/User/Profile'
import { useAuth } from './context/AuthContext';

import Introduction from './components/layouts/Introduction';




const RootRedirect = () => {
  const isAuthenticated = true; 
  return isAuthenticated ? <Navigate to="/login" replace /> : <Navigate to="/login" replace />;
};

const ProtectedLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;  // giữ nguyên loading
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DashboardLayout />;
};


const App = () => {
  return (
    <AuthProvider>
      {/* <Toaster 
        position="top-right" 
        reverseOrder={false} 
      /> */}
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* <Route path="/profile" element={<Profile />} /> */}
        
        <Route path="/" element={<RootRedirect />} />



        <Route element={<ProtectedLayout />}>
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/profile" element={<Profile />} />

          {/* <Route 
            path="/profile" 
            element={<ProtectedRoute permission="user:view"><Profile /></ProtectedRoute>} 
          /> */}


          <Route 
            path="/dashboard" 
            // element={ <ProtectedRoute permission="dashboard:view"><Home /></ProtectedRoute> } 
          />
          {/* product */}
          <Route 
            path="/products" 
            element={ <ProtectedRoute permission="product:view"><Products /></ProtectedRoute> } 
          />

          {/* category */}
          <Route 
            path="/categories" 
            element={ <ProtectedRoute permission="category:view"><Categories /></ProtectedRoute> } 
          />
          {/* type */}
          <Route 
            path="/types" 
            element={ <ProtectedRoute permission="type:view"><TypeDetail /></ProtectedRoute> } 
          />
          <Route 
            path="/types/add" 
            element={<ProtectedRoute permission="type:manage"><AddType /></ProtectedRoute>} 
          />

          <Route 
            path="/types/edit/:id" 
            element={<ProtectedRoute permission="type:manage"><EditType /></ProtectedRoute>} 
          />

          {/* role */}

          <Route path="/roles" element={<ProtectedRoute permission="role:view"><RoleList /></ProtectedRoute>} />
          <Route path="/roles/add" element={<ProtectedRoute permission="role:manage"><AddRole /></ProtectedRoute>} />
          <Route path="/roles/edit/:id" element={<ProtectedRoute permission="role:manage"><EditRole /></ProtectedRoute>} />
          <Route path="/roles/detail/:id" element={<RoleDetail />} />



          {/* order */}
          <Route 
            path="/orders" 
            element={ <ProtectedRoute permission="order:view"><Orders /></ProtectedRoute> } 
          />
          <Route 
            path="/orders/add" 
            element={ <ProtectedRoute permission="order:manage"><AddOrder /></ProtectedRoute> } 
          />
          <Route 
            path="/orders/edit/:order_id" 
            element={ <ProtectedRoute permission="order:view"><EditOrderAdmin /></ProtectedRoute> } 
          />

          {/* deal */}
          <Route 
            path="/deals" 
            element={ <ProtectedRoute permission="deal:view"><DealAdmin /></ProtectedRoute> } 
          />
          <Route 
            path="/deals/add" 
            element={ <ProtectedRoute permission="deal:manage"><AddDealAdmin /></ProtectedRoute> } 
          />
          <Route 
            path="/deals/edit/:deal_id" 
            element={ <ProtectedRoute permission="deal:view"><EditDealPage /></ProtectedRoute> } 
          />

          {/* user */}
          <Route 
            path="/users" 
            element={ <ProtectedRoute permission="user:view"><Users /></ProtectedRoute> } 
          />
          <Route 
            path="/users/add" 
            element={ <ProtectedRoute permission="user:manage"><AddUser /></ProtectedRoute> } 
          />
          <Route 
            path="/users/edit/:userId" 
            element={ <ProtectedRoute permission="user:manage"><EditUser /></ProtectedRoute> } 
          />
          <Route 
            path="/users/detail/:userId" 
            element={ <ProtectedRoute permission="user:view"><UserDetail /></ProtectedRoute> } 
          />

          {/* <Route 
            path="/reports" 
            element={ <ProtectedRoute permission="report:view"><Reports /></ProtectedRoute> } 
          /> */}
          <Route 
            path="/activitylog" 
            element={<Reports />} 
          />
        </Route>

        <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </AuthProvider>
  );
};
export default App
