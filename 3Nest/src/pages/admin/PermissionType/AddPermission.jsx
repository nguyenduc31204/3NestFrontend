import React, { useState } from 'react';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { BASE_URL } from '../../../utils/apiPath';

const initialFormState = {
    permission_type_name: '',
    description: ''
};

const AddPermission = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/permission_types/create-permission-type`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create permission type');
            }

            alert('Permission created successfully!'); 
            setFormData(initialFormState); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(initialFormState);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <DashboardLayout activeMenu="09">
                <div className="max-w-lg mx-auto mt-10 bg-white rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold mb-8 text-gray-800">Add Permission</h2>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                            Error: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="permission_type_name" className="block mb-2 font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                id="permission_type_name" 
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.permission_type_name}
                                onChange={handleChange}
                                placeholder="Enter permission name"
                                required 
                            />
                        </div>

                        <div className="mb-8">
                            <label htmlFor="description" className="block mb-2 font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description" // 7. Đổi `id` để khớp với state key
                                className="w-full border border-gray-300 rounded px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter description"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit" // Đổi thành type="submit"
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading} // 9. Vô hiệu hóa nút khi đang tải
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                type="button"
                                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded transition"
                                onClick={handleCancel}
                                disabled={loading} 
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </div>
    );
};

export default AddPermission;