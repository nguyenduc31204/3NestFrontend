import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

const EditTypeMana = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type_id: '',
    type_name: '',
    description: '',
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
            description: found.description || '',
            });
        } else {
            setError('Type not existed!');
        }
        } catch (err) {
        setError('error loading type');
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
      setSuccess('successfull!');
      setTimeout(() => navigate('/admin/types'), 1500);
    } catch (err) {
      setError('update type error!');
    }
  };



  if (loading) return <p className="p-4">Loadingg...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Edit Type</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          name="type_name"
          placeholder="type"
          value={formData.type_name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          rows={4}
        />

        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
          
        </div>
      </form>
    </div>
  );
};

export default EditTypeMana;
