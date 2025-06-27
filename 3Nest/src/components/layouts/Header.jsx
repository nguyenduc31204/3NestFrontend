import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageSquare, FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import logo from '../../assets/3nestv8.png';
import { useAuth } from '../../context/AuthContext';

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const settingsPath = '/profile';

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
          className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
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
          <NavLink
            to={settingsPath}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            <FiSettings className="mr-2" /> Profile
          </NavLink>
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
  <>
    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative" aria-label="Notifications">
      <FiBell className="w-5 h-5" />
      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
    </button>
    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative" aria-label="Messages">
      <FiMessageSquare className="w-5 h-5" />
      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500"></span>
    </button>
  </>
);

const Header = () => {
  const { user, isLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 p-4 bg-white shadow-sm border-b border-gray-100 text-gray-400">
        Loading...
      </header>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center">
        <Link to="/">
          <img src={logo} alt="3NestInvest Logo" className="h-8 w-auto sm:h-10 mx-2 sm:mx-7" />
        </Link>
      </div>

      {/* Search bar - desktop */}
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

      {/* Right section: icons and user */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          className="md:hidden p-2 text-gray-500 rounded-full hover:bg-gray-100"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Toggle search"
        >
          <FiSearch className="w-5 h-5" />
        </button>

        <HeaderIcons />
        <UserProfileDropdown user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile search bar */}
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
