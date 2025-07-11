import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../../utils/axiosInstance';


const AddType = () => {
  const [typeName, setTypeName] = useState('');
  const [type_description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeName || !type_description) {
      setError('Please enter full fields');
      return;
    }

    try {
      const response = await axiosInstance.post('/types/create-type', {
        type_name: typeName,

        type_description: type_description,
      });
      if ([200, 201].includes(response.status)) {
        navigate('/types');

      } else {
        setError('Cannot create new type');
      }
    } catch (err) {
      console.error(err);
      setError('Error creating type');
    }
  };

  return (
    <div>
        <div className="my-5 mx-auto">
          <div className="content p-20">
            <div className="page-header flex justify-between items-center mb-10">
              <div className="page-title">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Add New Type</h1>

              </div>
            </div>

            <div className="card bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="card-body p-6">
                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Type Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      rows="3"

                      value={type_description}

                      onChange={(e) => setDescription(e.target.value)}
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Add Type
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

export default AddType;
