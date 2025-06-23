import React, { useState, useEffect } from 'react'; 
import SideMenu from './SideMenu';
import Navbar from './Navbar';
import { BASE_URL } from '../../utils/apiPath';
import { decodeToken } from '../../utils/help';
import { Outlet, useLocation } from 'react-router-dom';



const DashboardLayout = ({ activeMenu }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const decode = decodeToken(localStorage.getItem('access_token')); 
    const [activeMenu2, setActiveMenu] = useState('');

  const location = useLocation();
  // console.log('Decoded Token:', decode);

  useEffect(() => {
    const currentPath = location.pathname; 
    
    if (currentPath.startsWith('/products')) {
      setActiveMenu('02');
    } else if (currentPath.startsWith('/orders')) {
      setActiveMenu('04');
    } else if (currentPath.startsWith('/users')) {
      setActiveMenu('05');
    }else if (currentPath.startsWith('/categories')) {
      setActiveMenu('03');
    } else if (currentPath.startsWith('/reports')) {
      setActiveMenu('06');
    }else if (currentPath.startsWith('/deals')) {
      setActiveMenu('08');
    } else if (currentPath.startsWith('/types')) {
      setActiveMenu('07');
    }else {
      setActiveMenu('01');
    }

  }, [location.pathname]);
  const loadPermission = async () => {
  try {
    const response = await fetch(`${BASE_URL}/permissions/get-permisisons-by-role?role_id=${decode?.role_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }
    const data = await response.json();
    setCurrentUser(data.data || null); 
    return data.data || [];
  } catch (error) {
    console.error('Error loading permissions:', error);
    return [];
  }
}

  useEffect(() => {
    loadPermission()
  }, []);
  // console.log('Current User:', currentUser);
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar activeMenu={activeMenu2} user={currentUser} />
      <div className='flex'>
        <div className='max-[1080px]:hidden '>
          <SideMenu activeMenu={activeMenu2} user={currentUser} />
        </div>

        <div className='grow mx-5'>
          {/* {React.cloneElement(children, { user: currentUser }) } */}
          <Outlet context={{ user: currentUser }} />
          {/* <Outlet /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;