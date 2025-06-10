import React, { useEffect, useState } from 'react';
import axiosInstance from "../../../utils/axiosIntance";
import { BASE_URL } from "../../../utils/apiPath";

const CategoryModal = ({ isOpen, onClose, onSubmitSuccess, category }) => {
  const [categoryName, setCategoryName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [types, setTypes] = useState([]);

  const isEdit = !!category;

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
        setCategoryName(category.category_name || '');
        setTypeId(category.type_id || '');
        setDescription(category.description || '');
    } else {
        setCategoryName('');
        setTypeId('');
        setDescription('');
    }

    axiosInstance.get(`${BASE_URL}/types/get-types`).then(res => {
        setTypes(res.data.data || []);
    });
    }, [category, isOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category_name: categoryName,
      type_id: Number(typeId),
      description
    };

    try {
      if (isEdit) {
        await axiosInstance.post(`${BASE_URL}/categories/update-category`, {
          ...payload,
          category_id: category.category_id
        });
      } else {
        await axiosInstance.post(`${BASE_URL}/categories/create-category`, payload);
      }
      console.log()
      onSubmitSuccess();
      onClose();
    } catch (error) {
      alert("Đã xảy ra lỗi khi gửi dữ liệu");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit' : 'Add'} Category</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className='w-full border p-2 rounded'
            required
          />
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className='w-full border p-2 rounded'
            required
          >
            <option value="">-- Select Type --</option>
            {types.map(type => (
              <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className='w-full border p-2 rounded'
          />
          <div className='flex justify-end space-x-2'>
            <button type='button' onClick={onClose} className='bg-gray-300 px-4 py-2 rounded'>Cancel</button>
            <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded'>{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
