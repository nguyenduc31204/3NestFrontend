import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';
import ConfirmationModal from './ConfirmationModal';
import StatusDisplay from './StatusDisplay';
import PermissionTable from './PermissionTable';
import TableToolbar from './TableToolbar';


const API_HEADERS = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
};

const fetchPermissionTypes = async () => {
    const response = await fetch(`${BASE_URL}/permission_types/get-permission-types`, {
        method: 'GET',
        headers: API_HEADERS,
    });
    if (!response.ok) {

        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch permission types.');
    }
    const result = await response.json();
    console.log('Permission Types:', result.data);
    return result.data; 
};

const deletePermissionTypeById = async (typeId) => {
    const response = await fetch(`${BASE_URL}/permission_types/delete-permission-type?request_id=${typeId}`, {
        method: 'DELETE',
        headers: API_HEADERS,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete permission type.');
    }
    return true; 
};

const PermissionTypePage = () => {
    const [permissionTypes, setPermissionTypes] = useState([]);
    const [status, setStatus] = useState('loading'); 
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const [isModalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const loadData = useCallback(async () => {
        setStatus('loading');
        setError(null);
        try {
            const data = await fetchPermissionTypes();
            setPermissionTypes(Array.isArray(data) ? data : []);
            setStatus('success');
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDeleteRequest = (id) => {
        setItemToDelete(id);
        setModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const originalData = [...permissionTypes];
        setPermissionTypes(prev => prev.filter(p => p.type_id !== itemToDelete));
            console.log(`Permission type with ID ${itemToDelete} deleted successfully.`);

        setModalOpen(false);
        try {
            await deletePermissionTypeById(itemToDelete);
        } catch (err) {
            setError(err.message);
            setPermissionTypes(originalData); 
        } finally {
            setItemToDelete(null);
        }
        loadData();
    };
    console.log('Permission Types:', itemToDelete);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * 5;
        return permissionTypes.slice(startIndex, startIndex + 5);
    }, [permissionTypes, currentPage]);

    const totalPages = Math.ceil(permissionTypes.length / 5);

    return (
        <>
            <Header />
            <DashboardLayout activeMenu='09'>
                <div className='my-5 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className="content py-5">
                        <div className="page-header flex flex-wrap justify-between items-center mb-10 gap-4">
                            <div className="page-title">
                                <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Permission Type Management</h1>
                                <div className="breadcrumb text-gray-500 text-sm">
                                    <span className='hover:text-blue-600 cursor-pointer' onClick={() => navigate('/admin/dashboard')}>Dashboard</span> / <span>Permission Types</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/pertype/add')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                            >
                                + Add Permission Type
                            </button>
                        </div>
                        <div className="card bg-white rounded-lg shadow-md overflow-hidden">
                            <TableToolbar onRefresh={loadData} />
                            <div className="card-body p-0">
                                <StatusDisplay status={status} error={error} dataLength={permissionTypes.length}>
                                    <PermissionTable
                                        data={paginatedData}
                                        onEdit={(id) => navigate(`/admin/types/edit/${id}`)}
                                        onDelete={handleDeleteRequest}
                                        currentPage={currentPage}
                                        itemsPerPage={10}
                                    />
                                    {/* {totalPages > 1 && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    )} */}
                                </StatusDisplay>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this permission type? This action cannot be undone."
            />
        </>
    );
};

export default PermissionTypePage;