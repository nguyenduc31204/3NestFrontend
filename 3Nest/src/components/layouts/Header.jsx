import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';
import logo from '../../assets/3nestv8.png';
import { useAuth } from '../../context/AuthContext';

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const settingsPath = user?.role_name === 'admin' ? '/admin/settings' : '/profile';

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="User menu"
        aria-expanded={isDropdownOpen}
      >
        <img
          src={user.avatar || '/default-avatar.png'}
          alt="User avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
        />
        <span className="hidden lg:inline-block text-sm font-medium text-gray-700 truncate">
          {user.name}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role_name}</p>
          </div>
          <Link
            to={settingsPath}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FiSettings className="mr-2" /> Profile
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
          >
            <FiLogOut className="mr-2" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const HeaderIcons = () => (
  <div className="flex items-center space-x-6">
    <button className="p-3 text-gray-600 rounded-full hover:bg-gray-200 relative" aria-label="Notifications">
      <FiBell className="w-6 h-6" />
      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
    </button>
    <button className="p-3 text-gray-600 rounded-full hover:bg-gray-200 relative" aria-label="Messages">
      <FiMessageSquare className="w-6 h-6" />
      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500"></span>
    </button>
  </div>
);

const Header = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 p-4 bg-gray-100 shadow-sm border-b border-gray-200 text-gray-400">
        Loading...
      </header>
    );
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-gray-400 text-white shadow-sm">

      <div className="flex items-center">
        <Link to="/">
          <img src={logo} alt="3NestInvest Logo" className="h-10 w-auto sm:h-12 mx-2 sm:mx-6" />
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        <HeaderIcons />
        <UserProfileDropdown user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header;
