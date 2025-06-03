

import React, { useState } from 'react';
import { FiSearch, FiBell, FiMessageSquare, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = {
    name: 'Admin User',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'admin'
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <img 
            src="" 
            alt="3NestInvest Logo" 
            className="h-8 w-auto" 
            onError={(e) => {
              e.target.onerror = null; 
            }}
          />
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative">
          <FiMessageSquare className="w-5 h-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500"></span>
        </button>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img 
              src={currentUser.avatar} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
            />
            <span className="hidden md:inline-block text-sm font-medium text-gray-700">
              {currentUser.name}
            </span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              
              <a 
                href="#" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="mr-2" /> Profile
              </a>
              
              <a 
                href="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiSettings className="mr-2" /> Settings
              </a>
              
              <a 
                href="/logout" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
              >
                <FiLogOut className="mr-2" /> Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;