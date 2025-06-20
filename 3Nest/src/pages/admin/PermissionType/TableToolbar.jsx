import React from 'react';
import {
  LuArrowDownToLine,
  LuArrowUpNarrowWide,
  LuRefreshCcw,
} from "react-icons/lu";


const TableToolbar = ({ onRefresh }) => {

  const handleExport = () => {
    alert('Chức năng Xuất Excel đang được phát triển!');
  };

  const handleFilter = () => {
    alert('Chức năng Lọc đang được phát triển!');
  };

  return (
    <div className="card-header flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800">
        Permission Types List
      </h2>

      <div className="tools flex items-center space-x-2">
        <button 
          onClick={handleExport}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-200 rounded-full transition-colors" 
          title="Export to Excel"
        >
          <LuArrowDownToLine className="w-5 h-5" />
        </button>
        <button 
          onClick={handleFilter}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-200 rounded-full transition-colors" 
          title="Filter"
        >
          <LuArrowUpNarrowWide className="w-5 h-5" />
        </button>
        <button 
          onClick={onRefresh}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-200 rounded-full transition-colors" 
          title="Refresh Data"
        >
          <LuRefreshCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TableToolbar;