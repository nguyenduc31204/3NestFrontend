import React, { useState, useEffect } from 'react'; 
import SideMenu from './SideMenu';
import Navbar from './Navbar';
import { BASE_URL } from '../../utils/apiPath';
import { decodeToken } from '../../utils/help';



const DashboardLayout = ({ children, activeMenu }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState();
  const decode = decodeToken(localStorage.getItem('access_token')); 
  console.log('Decoded Token:', decode);
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
  console.log('Current User:', currentUser);
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar activeMenu={activeMenu} user={currentUser} />
      <div className='flex'>
        <div className='max-[1080px]:hidden '>
          <SideMenu activeMenu={activeMenu} user={currentUser} />
        </div>

        <div className='grow mx-5'>
          {React.cloneElement(children, { user: currentUser }) }
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;