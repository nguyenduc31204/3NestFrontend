import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Products from './pages/admin/Product/Products'
import Categories from './pages/admin/Category/Categories'
import Orders from './pages/admin/Order/Orders'
import Reports from './pages/admin/Reports'
import Logout from './pages/admin/Logout'
import Users from './pages/admin/User/Users'
import AddOrder from './pages/admin/Order/AddOder'

import AddUser from './pages/admin/User/AddUser';
import EditUser from './pages/admin/User/EditUser';
import UserDetail from './pages/admin/User/UserDetail';


import ForgotPassword from './pages/Auth/ForgotPassword'

import AddType from './pages/admin/Type/AddType';
import EditType from './pages/admin/Type/EditType';
import TypeDetail from './pages/admin/Type/TypeDetail';

import DealAdmin from './pages/admin/Deal/Deal'
import AdminEditDeal from './pages/admin/Deal/Edit'
import EditOrderAdmin from './pages/admin/Order/EditOrder'
import AddPermission from './pages/admin/PermissionType/AddPermission'
import PermissionTypePage from './pages/admin/PermissionType'
import { Toaster } from 'react-hot-toast'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ProtectedRoute from './pages/Auth/ProtectedRoute'
import AddDealPage from './pages/Sales/Deal/AddDeal'
import Header from './components/layouts/Header'
import DashboardLayout from './components/layouts/DashboardLayout'
import EditDealPage from './pages/admin/Deal/Edit'
import AddDealAdmin from './pages/admin/Deal/AddDeal'
import { AuthProvider } from './context/AuthContext'

const RootRedirect = () => {
  const isAuthenticated = true; 
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const ProtectedLayout = () => {
  const isAuthenticated = true; 
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <DashboardLayout />;
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
      />
        <Header />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route path="/" element={<RootRedirect />} />


        <Route element={<ProtectedLayout />}>

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
            element={ <ProtectedRoute><Categories /></ProtectedRoute> } 
          />

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
            element={ <ProtectedRoute permission="order:manage"><EditOrderAdmin /></ProtectedRoute> } 
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
            element={ <ProtectedRoute permission="deal:manage"><EditDealPage /></ProtectedRoute> } 
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
            element={ <ProtectedRoute permission="user:manage"><UserDetail /></ProtectedRoute> } 
          />

          <Route 
            path="/reports" 
            element={ <ProtectedRoute permission="report:view"><Reports /></ProtectedRoute> } 
          />
        </Route>

        <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </AuthProvider>
  );
};
export default App
