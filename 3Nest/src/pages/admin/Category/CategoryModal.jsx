import React, { useEffect, useState } from 'react';
import axiosInstance from "../../../utils/axiosInstance";

const CategoryModal = ({ isOpen, onClose, onSubmitSuccess, category }) => {
  const [categoryName, setCategoryName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [types, setTypes] = useState([]);

  const isEdit = Boolean(category);

  useEffect(() => {
  if (!isOpen) return;

    const fetchTypesAndSetForm = async () => {
      try {
        const res = await axiosInstance.get("/types/get-types", {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        const fetchedTypes = res.data.data || [];
        setTypes(fetchedTypes);

        if (isEdit && category) {
          setCategoryName(category.category_name || '');
          setDescription(category.description || '');
          setTypeId(category.type_id?.toString() || '');
        } else {
          setCategoryName('');
          setDescription('');
          setTypeId(fetchedTypes[0]?.type_id?.toString() || '');
        }
      } catch (err) {
        console.error("Fetch types error:", err);
      }
    };

    fetchTypesAndSetForm();
  }, [isOpen, isEdit, category]);



  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    category_name: categoryName,
    type_id: Number(typeId),
    category_description: description
  };

  const config = {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  };

  const endpoint = isEdit
    ? "/categories/update-category"
    : "/categories/create-category";

  try {
    console.log("➡ Payload:", payload);
    console.log("➡ Endpoint:", endpoint);

    const res = await axiosInstance.post(
      endpoint,
      isEdit
        ? { ...payload, category_id: category.category_id }
        : payload,
      config
    );

    console.log("➡ Response:", res.data);

    onSubmitSuccess();
    onClose();
  } catch (error) {
    console.error("Category submit error:", error.response || error);
    alert(
      "Đã xảy ra lỗi khi gửi dữ liệu: " +
      (error.response?.data?.message || error.message)
    );
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-500/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? 'Update' : 'Add'} Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full border p-2 rounded"
            required
          />

          <select
            value={typeId}
            onChange={e => setTypeId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select Type --</option>
            {types.map(t => (
              <option key={t.type_id} value={String(t.type_id)}>
                {t.type_name}
              </option>
            ))}
          </select>


          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="description"
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
