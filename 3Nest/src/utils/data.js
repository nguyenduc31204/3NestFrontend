import { 
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingCart,
  Users,
  BarChart2,
} from 'lucide-react';

const VALID_ROLES = ['admin', 'sales', 'channel', 'manager'];

const validateRole = (role) => {
  return VALID_ROLES.includes(role) ? role : undefined;
};

export const SIDE_MENU_DATA = [
  {
    id: '01',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    roles: ['admin'],
    ariaLabel: 'Navigate to dashboard',
  },
  {
    id: '02',
    label: 'Products',
    icon: Package,
    path: (role) => {
      const validatedRole = validateRole(role);
      if (validatedRole === 'sales') return '/sales/products';
      if (validatedRole === 'admin') return '/admin/products';
      if (validatedRole === 'manager') return '/manager/products';
      return '/channel/products';
    },
    roles: ['admin', 'sales', 'channel', 'manager'],
    ariaLabel: 'Navigate to products',
  },
  {
    id: '03',
    label: 'Categories',
    icon: ListTree,
    path: '/categories',
    roles: ['admin', 'manager'],
    ariaLabel: 'Navigate to categories',
  },
  {
    id: '04',
    label: 'Orders',
    icon: ShoppingCart,
    path: (role) => {
      const validatedRole = validateRole(role);
      if (validatedRole === 'sales') return '/sales/orders';
      if (validatedRole === 'admin') return '/admin/orders';
      if (validatedRole === 'manager') return '/manager/orders';
      return '/channel/orders';
    },
    roles: ['admin', 'sales', 'channel', 'manager'],
    ariaLabel: 'Navigate to orders',
  },
  {
    id: '05',
    label: 'Users',
    icon: Users,
    path: '/users',
    roles: ['admin', 'manager'],
    ariaLabel: 'Navigate to users',
  },
  {
    id: '06',
    label: 'Reports',
    icon: BarChart2,
    path: '/reports',
    roles: ['admin', 'channel', 'sales', 'manager'],
    ariaLabel: 'Navigate to reports',
  },
  {
  id: '07',
  label: 'Types',
  icon: ListTree, 
  path: '/admin/types',
  roles: ['admin', 'manager'],
  ariaLabel: 'Navigate to types',
  },
{
  id: '08',
  label: 'Deals',
  icon: ShoppingCart,
  path: (role) => {
    const validatedRole = validateRole(role);
    if (validatedRole === 'sales') return '/sales/deals';
    if (validatedRole === 'admin') return '/admin/deals';
    if (validatedRole === 'manager') return '/manager/deals';
    return '/channel/deals';
  },
  roles: ['admin', 'sales', 'channel', 'manager'],
  ariaLabel: 'Navigate to deals',
},

];