import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Products from './pages/admin/Product/Products'
import Categories from './pages/admin/Category/Categories'
import Orders from './pages/admin/Order/Orders'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/User/Settings'
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
import AddType from './pages/admin/Type/AddType';
import EditType from './pages/admin/Type/EditType';
import TypeDetail from './pages/admin/Type/TypeDetail';



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
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/admin/dashboard" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/sales/products" element={<SalesProducts />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/sales/orders" element={<SalesOrders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/edit/:userId" element={<EditUser />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/addorder" element={<AddOrder />} />
        <Route path="/sales/addorder" element={<SalesAddOrder />} />
        <Route path="/sales/editorder/:order_id" element={<SalesAddOrder />} />
        <Route path="/users/detail/:userId" element={<UserDetail />} />
        <Route path='/admin/types' element={<TypeDetail />} />
        <Route path='/admin/types/add' element={<AddType />} />
        <Route path='/admin/types/edit/:id' element={<EditType />} />

      </Routes>
    </div>
  )
}
export default App
