import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('createdOrderId');

       

       
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        
        navigate('/login');
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Logging out...</h2>
        <p className="text-gray-600 mt-2">Please wait while we sign you out.</p>
      </div>
    </div>
  );
};

export default Logout;
