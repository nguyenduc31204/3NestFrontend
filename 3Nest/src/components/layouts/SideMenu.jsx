import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA } from '../../utils/data'; 
import { canAccess } from '../../utils/permissionUtils'; 

const SideMenu = ({ activeMenu }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUserString = localStorage.getItem('user');
    if (storedUserString) {
      try {
        setUser(JSON.parse(storedUserString));
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
        localStorage.removeItem('user'); 
      }
    }
  }, []); 

  const filteredMenuItems = user
    ? SIDE_MENU_DATA.filter(item => canAccess(user, item.resourceType))
    : []; 

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  if (!user) {
    return (
      <div className="w-full h-full bg-white shadow-md rounded-lg p-6">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white shadow-md rounded-lg p-6">
      <div className="space-y-2">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center gap-4 text-[15px] 
              ${
                activeMenu === item.id 
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