import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axiosInstance from '../../../utils/axiosInstance';

import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';

const EditType = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type_id: '',
    type_name: '',
    type_description: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axiosInstance.get('/types/get-types');
        const allTypes = res.data?.data || [];
        const found = allTypes.find(t => String(t.type_id) === String(id));
        if (found) {
          setFormData({
            type_id: found.type_id,
            type_name: found.type_name || '',

            type_description: found.type_description || '',

          });
        } else {
          setError('Type not existed!');
        }
      } catch (err) {
        setError('Error loading type');
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.post('/types/update-type', formData);
      setSuccess('Updated successfully!');

      setTimeout(() => navigate('/types'), 1500);

    } catch (err) {
      setError('Update type error!');
    }
  };

  if (loading) return <p className="p-8 text-center text-blue-600">Loading type...</p>;

  return (
    <div>

      

        <div className="my-5 mx-auto">
          <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
              <div className="page-title">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Edit Type</h1>

                <div className="text-sm mt-1">
                    <a href="/types" className="text-gray-600 hover:underline">← Back</a>
                  </div>

              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden">
              <div className="card-body p-6">
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Type Name</label>
                    <input
                      type="text"
                      name="type_name"
                      value={formData.type_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea

                      name="type_description"
                      value={formData.type_description}

                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"

                      onClick={() => navigate('/types')}

                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"

                      className="px-4 py-2 bg-blue-600 hover:bg-gray-700 text-white rounded"

                    >
                      Update Type
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

    </div>
  );
};

export default EditType;
