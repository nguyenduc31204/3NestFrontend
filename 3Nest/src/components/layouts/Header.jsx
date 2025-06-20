
import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiMessageSquare, FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/apiPath';
import logo from '../../assets/3nestv8.png';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      // if (!token) {
      //   setError('No authentication token found');
      //   navigate('/login');
      //   return;
      // }

      try {
        const response = await fetch(`${BASE_URL}/users/my-info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        
        const result = await response.json();
        console.log('User Info Response:', result);
        if (response.ok && result.status_code === 200) {
          setCurrentUser({
            name: result.data.name || 'Unknown User',
            avatar: result.data.avatar || '',
            role: result.data.role || 'user',
          });
        } else {
          throw new Error(result.message || 'Failed to fetch user info');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('createdOrderId');
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const settingsPath = currentUser?.role === 'admin' ? '/admin/settings' :
                      currentUser?.role === 'sales' ? '/sales/settings' :
                      currentUser?.role === 'channel' ? '/channel/settings' :
                      '/profile';

  if (error) {
    return null;
  }

  if (!currentUser) {
    return <div className="p-4 text-center text-gray-500">Loading user info...</div>;
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-100">
      {/* Logo Section */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="3NestInvest Logo"
          className="h-8 w-auto sm:h-10 mx-2 sm:mx-7"
          onError={(e) => {
            e.target.src = '';
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Search Bar - Hidden on mobile, toggled by search icon */}
      <div className="hidden md:flex flex-1 max-w-xl mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right Section: Icons and User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Icon for Mobile */}
        <button
          className="md:hidden p-2 text-gray-500 rounded-full hover:bg-gray-100"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Toggle search"
        >
          <FiSearch className="w-5 h-5" />
        </button>

        {/* Notification and Message Icons */}
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative" aria-label="Notifications">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative" aria-label="Messages">
          <FiMessageSquare className="w-5 h-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
          >
            <img
              src={currentUser.avatar}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
              onError={(e) => {
                e.target.src = '';
                e.target.onerror = null;
              }}
            />
            <span className="hidden lg:inline-block text-sm font-medium text-gray-700 truncate">
              {currentUser.name}
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <NavLink
                to={settingsPath}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FiSettings className="mr-2" /> Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
              >
                <FiLogOut className="mr-2" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar - Full width when toggled */}
      {isSearchOpen && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-white border-b border-gray-100 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              aria-label="Search"
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
