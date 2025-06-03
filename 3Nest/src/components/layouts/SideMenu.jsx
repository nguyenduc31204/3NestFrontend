import React, { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA } from '../../utils/data';

const SideMenu = ({ activeMenu }) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'guest'; 

  const handleNavigation = (item) => {
    if (item.roles && !item.roles.includes(userRole)) {
      console.warn(`Bạn không có quyền truy cập ${item.label}`);
      return;
    }



    const path = typeof item.path === 'function' ? item.path(userRole) : item.path;
    navigate(path);
  };



  const filteredMenuItems = SIDE_MENU_DATA.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="w-full h-full bg-white shadow-md rounded-lg p-6">
      <div className="space-y-2">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center gap-4 text-[15px] 
              ${
                activeMenu === item.id // Sử dụng id thay vì label để so sánh chính xác hơn
                  ? "text-white bg-primary"
                  : "text-gray-700 hover:bg-gray-100"
              } 
              py-3 px-4 rounded-lg transition duration-200`}
            aria-current={activeMenu === item.id ? "page" : undefined}
          >
            {item.icon && <item.icon className="text-xl" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideMenu;