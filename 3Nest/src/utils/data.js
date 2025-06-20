import { 
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingCart,
  Users,
  BarChart2,
} from 'lucide-react';

export const SIDE_MENU_DATA = [
  {
    id: '01', // Dùng tên resource làm ID cho nhất quán
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard', // Một đường dẫn chung
    resourceType: 'dashboard', // Key để kiểm tra quyền
    ariaLabel: 'Navigate to dashboard',
  },
  {
    id: '02',
    label: 'Products',
    icon: Package,
    path: '/products', // Một đường dẫn chung
    resourceType: 'product', // Key để kiểm tra quyền
    ariaLabel: 'Navigate to products',
  },
  {
    id: '03',
    label: 'Categories',
    icon: ListTree,
    path: '/categories',
    resourceType: 'category',
    ariaLabel: 'Navigate to categories',
  },
  {
    id: '04',
    label: 'Orders',
    icon: ShoppingCart,
    path: '/orders',
    resourceType: 'order',
    ariaLabel: 'Navigate to orders',
  },
  {
    id: '05',
    label: 'Users',
    icon: Users,
    path: '/users',
    resourceType: 'user',
    ariaLabel: 'Navigate to users',
  },
  {
    id: '06',
    label: 'Reports',
    icon: BarChart2,
    path: '/reports',
    resourceType: 'report',
    ariaLabel: 'Navigate to reports',
  },
  {
    id: '07',
    label: 'Types',
    icon: ListTree, 
    path: '/types',
    resourceType: 'type',
    ariaLabel: 'Navigate to types',
  },
  {
    id: '08',
    label: 'Deals',
    icon: ShoppingCart,
    path: '/deals',
    resourceType: 'deal',
    ariaLabel: 'Navigate to deals',
  },
  {
    id: '09',
    label: 'Per Type', 
    icon: ShoppingCart, 
    path: '/pertype',
    resourceType: 'per_type', 
    ariaLabel: 'Navigate to per type reports',
  },
];