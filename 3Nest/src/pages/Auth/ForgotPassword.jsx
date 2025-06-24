import React, { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Header from '../../components/layouts/Header';
import { useForm } from 'react-hook-form';
import { BASE_URL } from '../../utils/apiPath';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
     
      const queryParams = new URLSearchParams({
        email: data.email,
        phone: data.phone,
      }).toString();
      const url = `${BASE_URL}/users/forgot-password?${queryParams}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        
      });

      const result = await response.json();
      console.log('Reset Password API Response:', result); 

      if (response.ok && result.status_code === 200) {
        setSuccess(result.mess || 'Password reset successfully. Check your email for the new password.');
        reset();
      } else {
        throw new Error(result.mess || 'Failed to process reset password request');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                  Forgot Password
                </h1>
                {/* <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Forgot Password
                </div> */}
              </div>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Reset Your Password
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your email and phone number to receive a password reset link.
                </p>

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
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email format',
                        },
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
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

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
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
                      {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
