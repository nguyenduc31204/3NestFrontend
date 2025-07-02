import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SideMenu from './SideMenu';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const { user: currentUser, isLoading } = useAuth();
  const location = useLocation();

  const [activeMenu2, setActiveMenu] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // NEW

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/products')) setActiveMenu('02');
    else if (currentPath.startsWith('/orders')) setActiveMenu('08');
    else if (currentPath.startsWith('/users')) setActiveMenu('05');
    else if (currentPath.startsWith('/categories')) setActiveMenu('03');
    else if (currentPath.startsWith('/reports')) setActiveMenu('06');
    else if (currentPath.startsWith('/deals')) setActiveMenu('04');
    else if (currentPath.startsWith('/types')) setActiveMenu('07');
    else if (currentPath.startsWith('/roles')) setActiveMenu('10');

    else if (currentPath.startsWith('/activitylog')) setActiveMenu('11');

    else setActiveMenu('01');
  }, [location.pathname]);

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      {isSidebarOpen && (
        <div className="fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg p-4 md:hidden">
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-700">
              ✖
            </button>
          </div>
          <SideMenu activeMenu={activeMenu2} user={currentUser}
          onItemClick={() => setIsSidebarOpen(false)} />

          
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1">
        <div className="hidden md:block">
          <SideMenu activeMenu={activeMenu2} user={currentUser} 
          onItemClick={() => setIsSidebarOpen(false)}/>
          
        </div>
        <main className="flex-1 overflow-auto px-4 py-4">
          <Outlet context={{ user: currentUser }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
