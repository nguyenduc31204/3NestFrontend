import { 
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingCart,
  Users,
  BarChart2,
} from 'lucide-react';

const VALID_ROLES = ['admin', 'sales', 'channel'];

const validateRole = (role) => {
  return VALID_ROLES.includes(role) ? role : undefined;
};

export const SIDE_MENU_DATA = [
  {
    id: '01',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
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
      return '/channel/products';
    },
    roles: ['admin', 'sales'],
    ariaLabel: 'Navigate to products',
  },
  {
    id: '03',
    label: 'Categories',
    icon: ListTree,
    path: '/categories',
    roles: ['admin'],
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
      return '/channel/orders';
    },
    roles: ['admin', 'sales'],
    ariaLabel: 'Navigate to orders',
  },
  {
    id: '05',
    label: 'Users',
    icon: Users,
    path: '/users',
    roles: ['admin'],
    ariaLabel: 'Navigate to users',
  },
  {
    id: '06',
    label: 'Reports',
    icon: BarChart2,
    path: '/reports',
    roles: ['admin', 'channel', 'sales'],
    ariaLabel: 'Navigate to reports',
  },
];