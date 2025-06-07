import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layouts/Header';
import { BASE_URL } from '../../../utils/apiPath';

const ChannelSetting = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      user_id: 0,
      user_name: '',
      company_name: '',
      status: false,
      phone: '',
    },
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/users/my-info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const result = await response.json();
        console.log('User Info API Response:', result); 

        if (response.ok && result.status_code === 200) {
          setUserInfo(result.data);
          setValue('user_id', result.data.user_id || 0);
          setValue('user_name', result.data.user_name || '');
          setValue('company_name', result.data.company_name || '');
          setValue('status', result.data.status || false);
          setValue('phone', result.data.phone || '');
        } else {
          throw new Error(result.message || 'Failed to fetch user info');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate, setValue]);

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          user_id: data.user_id,
          user_name: data.user_name,
          company_name: data.company_name,
          status: data.status,
          phone: data.phone,
        }),
      });

      const result = await response.json();
      console.log('Update User API Response:', result); 

      if (response.ok && result.status_code === 200) {
        setSuccess(result.message || 'User information updated successfully.');
        setUserInfo({
          ...userInfo,
          user_name: data.user_name,
          company_name: data.company_name,
          status: data.status,
          phone: data.phone,
        });
      } else {
        throw new Error(result.message || 'Failed to update user info');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading user info...</div>
    );
  }

  return (
    <div>
      <Header />
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                  Profile Settings
                </h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Profile
                </div>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Update Your Profile
                </h2>

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-400 mb-4">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Name</label>
                    <input
                      type="text"
                      {...register('user_name', {
                        required: 'User name is required',
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                    {errors.user_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.user_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      {...register('company_name')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      placeholder="Enter company name"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^\+?\d{10,15}$/,
                          message: 'Invalid phone number (10-15 digits, optional +)',
                        },
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('status')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">
                      Active Status
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/channel/products')}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm disabled:bg-gray-200"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-blue-200"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
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

export default ChannelSetting;
