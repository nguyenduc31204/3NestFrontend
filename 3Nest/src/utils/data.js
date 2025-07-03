import {
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingCart,
  Users,
  BarChart2,
  Tag,
  Folders,
  Settings,
  Layers,
  Building2,
} from 'lucide-react';
export const SIDE_MENU_DATA = [
  {
    id: '01',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    resourceType: 'dashboard',
    ariaLabel: 'Navigate to dashboard',
  },
   {
    id: '04',
    label: 'Registrations',
    icon: Tag,
    path: '/deals',
    resourceType: 'deal',
    ariaLabel: 'Navigate to deals',
  },
  {
    id: '08',
    label: 'Quotes',
    icon: ShoppingCart,
    path: '/orders',
    resourceType: 'order',
    ariaLabel: 'Navigate to Quote',
  },
  
   {
    id: '07',
    label: 'Companies',
    icon: Building2,
    path: '/types',
    resourceType: 'type',
    ariaLabel: 'Navigate to types',
  },
  {
    id: '03',
    label: 'Categories',
    icon: Folders,
    path: '/categories',
    resourceType: 'category',
    ariaLabel: 'Navigate to categories',
  },
  {
    id: '02',
    label: 'Items',
    icon: Package,
    path: '/products',
    resourceType: 'product',
    ariaLabel: 'Navigate to products',
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
    id: '10',
    label: 'Roles',
    icon: Settings,
    path: '/roles',
    resourceType: 'role',
    ariaLabel: 'Navigate to roles',
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
    id: '09',
    label: 'Per Type',
    //icon: ShoppingCart,
    path: '/pertype',
    resourceType: 'per_type',
    ariaLabel: 'Navigate to per type reports',
  },
  
  {
    id: '11',
    // label: 'Act Log',
    icon: ListTree,
    label: 'Activities Log',
    // icon: ListTree,
    path: '/activitylog',
    resourceType: 'role',
    ariaLabel: 'Navigate to activity log',
  },
];






