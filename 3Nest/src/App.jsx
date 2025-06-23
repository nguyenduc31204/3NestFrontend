import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Products from './pages/admin/Product/Products'
import Categories from './pages/admin/Category/Categories'
import Orders from './pages/admin/Order/Orders'
import Reports from './pages/admin/Reports'
import Logout from './pages/admin/Logout'
import Users from './pages/admin/User/Users'
import AddOrder from './pages/admin/Order/AddOder'
import Home from './pages/admin/Dashboard/Home'
import SalesProducts from './pages/Sales/Products/SalesProducts'
import SalesOrders from './pages/Sales/Order/SalesOrder'
import SalesAddOrder from './pages/Sales/Order/AddOder'
import AddUser from './pages/admin/User/AddUser';
import EditUser from './pages/admin/User/EditUser';
import UserDetail from './pages/admin/User/UserDetail';
import ProductDetail from './pages/admin/Product/ProductDetail'

import RoleList from './pages/admin/Role/RoleList';
import AddRole from './pages/admin/Role/AddRole';
import EditRole from './pages/admin/Role/EditRole';
import RoleDetail from './pages/admin/Role/RoleDetail';


import ForgotPassword from './pages/Auth/ForgotPassword'
import SalesSetting from './pages/Sales/User/SalesSetting'
import Setting from './pages/admin/User/Setting'
import ChannelSetting from './pages/Channel/User/ChannelSetting'
import AddType from './pages/admin/Type/AddType';
import EditType from './pages/admin/Type/EditType';
import TypeDetail from './pages/admin/Type/TypeDetail';
import ChannelProducts from './pages/Channel/Products/ChanelProducts'
import TypeDetailMana from './pages/Manager/Type/TypeDetail'
import AddTypeMana from './pages/Manager/Type/AddType'
import EditTypeMana from './pages/Manager/Type/EditType'
import ProductsMana from './pages/Manager/Product/Products'
// import AddOrderMana from './pages/Manager/Order/AddOder'
import OrdersMana from './pages/Manager/Order/Orders'
import Deal from './pages/Sales/Deal/Deal'
import SalesEditDeal from './pages/Sales/Deal/Edit'
import EditOrder from './pages/Sales/Order/EditOrder'
import AddDealChannel from './pages/Channel/Deal/AddDeal'
import ChannelEditDeal from './pages/Channel/Deal/Edit'
import DealChannel from './pages/Channel/Deal/Deal'
import EditOrderChannel from './pages/Channel/Order/EditOrderChannel'
import ChannelAddOrder from './pages/Channel/Order/ChannelAddOrder'
import ChannelOrders from './pages/Channel/Order/ChannelOrders'
import DealMana from './pages/Manager/Deal/Deal'
import ManaEditDeal from './pages/Manager/Deal/Edit'
import EditOrderMana from './pages/Manager/Order/EditOrder'
import DealAdmin from './pages/admin/Deal/Deal'
import AdminEditDeal from './pages/admin/Deal/Edit'
import EditOrderAdmin from './pages/admin/Order/EditOrder'
import AddPermission from './pages/admin/PermissionType/AddPermission'
import PermissionTypePage from './pages/admin/PermissionType'
import { Toaster } from 'react-hot-toast'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ProtectedRoute from './pages/Auth/ProtectedRoute'
import DashboardLayout from './components/layouts/DashboardLayout'
import AddDealPage from './pages/Sales/Deal/AddDeal'



const Root = () => {
  const isAuthenticated = !!localStorage.getItem('access_token')

  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  )
}


const App = () => {
  return (
    <div>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        gutter={8} 
        containerClassName="p-4" 
        toastOptions={{
          duration: 3000, // Thời gian tự động đóng
          className: 'min-w-[250px] max-w-[350px] p-4 text-base font-semibold rounded-lg shadow-lg flex items-center justify-between',
          style: {
            background: '#fff',
            color: '#374151', 
          },
          success: {
            duration: 3000, 
            className: 'bg-green-100 border border-green-400 text-green-800',
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000, 
            className: 'bg-red-100 border border-red-400 text-red-800',
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            className: 'bg-blue-100 border border-blue-400 text-blue-800',
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />


        {/* admin */}
        <Route path="/admin/dashboard" element={<Home />} />
        <Route path="/admin/products" element={<Products />} />
    
        <Route path="/admin/orders" element={<Orders />} />
        <Route path='/admin/types' element={<TypeDetail />} />
        <Route path="/admin/settings" element={<Setting />} />
        <Route path="/admin/addorder" element={<AddOrder />} />
        <Route path="/admin/editorder/:order_id" element={<EditOrderAdmin />} />
        <Route path='/admin/types/add' element={<AddType />} />
        <Route path='/admin/types/edit/:id' element={<EditType />} />
        <Route path="/admin/orders/add" element={<AddOrder />} />

        <Route path="/admin/roles" element={<RoleList />} />
        <Route path="/admin/roles/add" element={<AddRole />} />
        <Route path="/admin/roles/edit/:id" element={<EditRole />} />
        <Route path="/admin/roles/detail/:id" element={<RoleDetail />} />


        <Route path="/admin/deals" element={<DealAdmin />} />
        <Route path="/admin/editdeals/:deal_id" element={<AdminEditDeal />} />
        {/* <Route path="/admin/adddeals" element={<AddDealAdmin />} /> */}

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route path="/" element={<Navigate to="/products" replace />} />



        
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute permission="dashboard:view">
            {/* <DashboardLayout activeMenu="dashboard"><DashboardHomePage /></DashboardLayout> */}
          </ProtectedRoute>
        }/>

        {/* Products */}
        <Route path="/products" element={
          <ProtectedRoute permission="product:view">
              <Products />
          // </ProtectedRoute>
        }/>

        {/* Orders */}
        <Route path="/orders" element={
          <ProtectedRoute permission="order:manage">
            <Orders />
          </ProtectedRoute>
        }/>
        <Route path="/orders/add" element={
          <ProtectedRoute permission="order:manage">
            <AddOrder />
          </ProtectedRoute>
        }/>
        <Route path="/orders/edit/:order_id" element={
          <ProtectedRoute permission="order:manage">
            <EditOrderAdmin />
          </ProtectedRoute>
        }/>

        {/* Categories */}
        <Route path="/categories" element={
          <ProtectedRoute permission="category:manage">
            <Categories />
          </ProtectedRoute>
        }/>
        
        
        {/* Users */}
        <Route path="/users" element={
          <ProtectedRoute permission="user:view">
            <Users />
          </ProtectedRoute>
        }/>
        <Route path="/users/add" element={
          <ProtectedRoute permission="user:manage">
            <AddUser />
          </ProtectedRoute>
        }/>
        <Route path="/users/edit/:userId" element={
          <ProtectedRoute permission="user:manage">
            <EditUser />
          </ProtectedRoute>
        }/>
        <Route path="/users/detail/:userId" element={
          <ProtectedRoute permission="user:view">
            <UserDetail />
          </ProtectedRoute>
        }/>

        {/* Deals */}
        <Route path="/deals" element={
          <ProtectedRoute permission="deal:manage">
            <DealAdmin />
          </ProtectedRoute>
        }/>
        <Route path="/deals/add" element={
          <ProtectedRoute permission="deal:manage">
            <AddDealPage />
          </ProtectedRoute>
        }/>
        <Route path="/deals/edit/:deal_id" element={
          <ProtectedRoute permission="deal:manage">
            <AdminEditDeal />
          </ProtectedRoute>
        }/>

        {/* Types */}
        <Route path="/types" element={
          <ProtectedRoute permission="type:view">
            <TypeDetail />
          </ProtectedRoute>
        }/>
        <Route path="/types/add" element={
          <ProtectedRoute>
            <AddType />
          </ProtectedRoute>
        }/>
        <Route path="/types/edit/:id" element={
          <ProtectedRoute>
            <EditType />
          </ProtectedRoute>
        }/>
        
        {/* Permission Type */}
        <Route path="/pertype" element={
          <ProtectedRoute>
            <PermissionTypePage />
          </ProtectedRoute>
        }/>
        <Route path="/pertype/add" element={
          <ProtectedRoute>
            <AddPermission />
          </ProtectedRoute>
        }/>

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute permission="report:view">
            <Reports />
          </ProtectedRoute>
        }/>

        <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </div>
  )
}
export default App
