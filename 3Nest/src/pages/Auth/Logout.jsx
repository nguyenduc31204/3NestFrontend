import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear the access token from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('createdOrderId'); // Clear any other stored data if needed

        // Optional: Call a server-side logout endpoint if your API supports it
        // const response = await fetch(`${BASE_URL}/auth/logout`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        //     'ngrok-skip-browser-warning': 'true',
        //   },
        // });
        // if (!response.ok) throw new Error('Logout failed');

        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if server-side logout fails
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
