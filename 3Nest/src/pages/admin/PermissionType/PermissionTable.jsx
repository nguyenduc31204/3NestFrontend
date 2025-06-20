import React from 'react';
import { LuPencil, LuTrash2 } from "react-icons/lu";

const PermissionTable = ({ data, onEdit, onDelete, currentPage, itemsPerPage }) => {
    return (
        <div className="table-responsive overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((type, index) => (
                        <tr key={type.permission_type_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-700">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.permission_type_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={type.description}>
                                {type.description}
                            </td>
                            <td className="px-6 py-4 text-sm text-right space-x-2">
                                <button
                                    onClick={() => onEdit(type.permission_type_id)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                                    title="Edit"
                                >
                                    <LuPencil size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(type.permission_type_id)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                                    title="Delete"
                                >
                                    <LuTrash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionTable;