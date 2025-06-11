import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { API_PATHS } from '../../../utils/apiPath';

const AddTypeMana = () => {
  const [typeName, setTypeName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeName || !description) {
      setError('Please enter full fields');
      return;
    }

    try {
      const response = await axiosInstance.post('/types/create-type', {
        type_name: typeName,
        description: description,
        });

      if (response.status === 200 || response.status === 201) {
        navigate('/admin/types');
      } else {
        setError('Can not create new type');
      }
    } catch (err) {
      console.error(err);
      setError('error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">New Type</h2>
      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Type Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default AddTypeMana;
