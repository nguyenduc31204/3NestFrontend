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

import ForgotPassword from './pages/Auth/ForgotPassword'
import SalesSetting from './pages/Sales/User/SalesSetting'
import Setting from './pages/admin/User/Setting'
import ChannelSetting from './pages/Channel/User/ChannelSetting'
import AddType from './pages/admin/Type/AddType';
import EditType from './pages/admin/Type/EditType';
import TypeDetail from './pages/admin/Type/TypeDetail';
import ChannelProducts from './pages/Channel/Products/SalesProducts'
import TypeDetailMana from './pages/Manager/Type/TypeDetail'
import AddTypeMana from './pages/Manager/Type/AddType'
import EditTypeMana from './pages/Manager/Type/EditType'
import ProductsMana from './pages/Manager/Product/Products'
// import AddOrderMana from './pages/Manager/Order/AddOder'
import OrdersMana from './pages/Manager/Order/Orders'
import Deal from './pages/Sales/Deal/Deal'
import AddDeal from './pages/Sales/Deal/AddDeal'
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
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* admin */}
        <Route path="/admin/dashboard" element={<Home />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path='/admin/types' element={<TypeDetail />} />
        <Route path="/admin/settings" element={<Setting />} />
        <Route path="/admin/addorder" element={<AddOrder />} />
        <Route path="/admin/editorder/:order_id" element={<AddOrder />} />
        <Route path='/admin/types/add' element={<AddType />} />
        <Route path='/admin/types/edit/:id' element={<EditType />} />
        {/* sales */}
        <Route path="/sales/products" element={<SalesProducts />} />
        <Route path="/sales/orders" element={<SalesOrders />} />
        <Route path="/sales/settings" element={<SalesSetting />} />
        <Route path="/sales/addorder" element={<SalesAddOrder />} />
        <Route path="/sales/orders/add" element={<SalesAddOrder />} />
        <Route path="/sales/adddeals" element={<AddDeal />} />
        <Route path="/sales/editorder/:order_id" element={<EditOrder />} />
        <Route path="/sales/editdeals/:deal_id" element={<SalesEditDeal />} />
        <Route path="/sales/deals" element={<Deal />} />
        {/* channel */}
        <Route path="/channel/products" element={<ChannelProducts />} />
        <Route path="/channel/orders" element={<ChannelOrders />} />
        <Route path="/channel/settings" element={<ChannelSetting />} />
        <Route path="/channel/addorder" element={<ChannelAddOrder />} />
        <Route path="/channel/orders/add" element={<ChannelAddOrder />} />
        <Route path="/channel/adddeals" element={<AddDealChannel />} />
        <Route path="/channel/deals" element={<DealChannel />} />
        <Route path="/channel/editorder/:order_id" element={<EditOrderChannel />} />
        <Route path="/channel/editdeals/:deal_id" element={<ChannelEditDeal />} />

        {/* manager */}
        <Route path="/manager/products" element={<ProductsMana />} />
        {/* <Route path="/manager/addorder" element={<AddOrderMana />} /> */}
        <Route path="/manager/orders" element={<OrdersMana />} />
        <Route path='/manager/types' element={<TypeDetailMana />} />
        <Route path='/manager/types/add' element={<AddTypeMana />} />
        <Route path="/manager/editorder/:order_id" element={<EditOrderMana />} />
        <Route path="/manager/deals" element={<DealMana />} />
        <Route path="/manager/editdeals/:deal_id" element={<ManaEditDeal />} />
        <Route path='/manager/types/edit/:id' element={<EditTypeMana />} />


        <Route path="/categories" element={<Categories />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/edit/:userId" element={<EditUser />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users/detail/:userId" element={<UserDetail />} />

      </Routes>
    </div>
  )
}
export default App
