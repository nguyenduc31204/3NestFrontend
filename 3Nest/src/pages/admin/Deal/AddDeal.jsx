import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Header from '../../../components/layouts/Header';
import { decodeToken } from '../../../utils/help';
import { BASE_URL } from '../../../utils/apiPath';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const AddDealAdmin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [tinError, setTinError] = useState(null);
  const [loadingTin, setLoadingTin] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      deal_type: '',
      description: '',
      tax_indentification_number: '',
      customer_name: '',
      domain_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      status: '',
      address: '',
      billing_address: '',
    },
  });

  const taxIndentificationNumber = watch('tax_indentification_number');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    } else {
      setError('No authentication token found');
    }
  }, []);

  useEffect(() => {
    if (taxIndentificationNumber && taxIndentificationNumber.length < 10) {
      setTinError('Tax identification number must be at least 10 digits');
      setValue('customer_name', '');
      setValue('address', '');
      return;
    }

    setTinError(null);

    if (taxIndentificationNumber && taxIndentificationNumber.length >= 10) {
      const validateTin = async () => {
        setLoadingTin(true);
        setTinError(null);
        try {
          const response = await fetch(`https://api.vietqr.io/v2/business/${taxIndentificationNumber}`, {
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          });
          const result = await response.json();
          if (result.code === '00' && result.data) {
            setValue('customer_name', result.data.name || '');
            setValue('address', result.data.address || '');
          } else {
            setTinError(result.desc || 'Invalid tax identification number');
            setValue('customer_name', '');
            setValue('address', '');
          }
        } catch (err) {
          setTinError('Failed to validate tax identification number');
          console.error('TIN validation error:', err);
        } finally {
          setLoadingTin(false);
        }
      };

      const debounce = setTimeout(validateTin, 500);
      return () => clearTimeout(debounce);
    }
  }, [taxIndentificationNumber, setValue]);

  const handleSaveDeal = async (data, status) => {
    setLoadingSubmit(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/deals/create-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ ...data, status }),
      });

      const result = await response.json();
      // if (!response.ok || result.status_code !== 200) {
      //   throw new Error(result.message || `Failed to ${status === 'draft' ? 'save' : 'submit'} deal`);
      // }
      console.log("loi", result)

      if (result.data && result.data.deal_id) {
        navigate(`/admin/editdeals/${result.data.deal_id}`);
        toast.success('Add Deal Succsess!')
      } else {
        toast.error('The tax identification number has been used.');
        // navigate('/admin/editdeals/0');
      }
    } catch (err) {
      // setError(`Failed to ${status === 'draft' ? 'save' : 'submit'} deal: ${err.message}`);
      console.error(`Error in ${status === 'draft' ? 'save' : 'submit'} deal:`, err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Handle Save as Draft
  const onSaveDraft = (data) => {
    handleSaveDeal(data, 'draft');
    console.log("data", data)
  };

  // Handle Submit
  const onSubmit = (data) => {
    handleSaveDeal(data, 'submitted');
    console.log("data", data)

  };

  return (
    <div>
      <Header />
      <Toaster position="top-right" reverseOrder={false} />
      <DashboardLayout activeMenu="08">
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="page-title">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Add Deal</h1>
                <div className="breadcrumb text-sm text-gray-500">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a> / Add Deal
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="w-full max-w-4xl mx-auto">
              <h1 className="text-xl sm:text-2xl font-semibold mb-6">Deal Information</h1>
              <form className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tax Identification Number <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('tax_indentification_number', {
                            required: 'Tax identification number is required',
                            minLength: {
                              value: 10,
                              message: 'Tax identification number must be at least 10 digits',
                            },
                          })}
                          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base ${
                            tinError || errors.tax_indentification_number ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter tax identification number"
                          disabled={loadingTin}
                        />
                        {loadingTin && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <svg
                              className="animate-spin h-5 w-5 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.tax_indentification_number && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.tax_indentification_number.message}
                        </p>
                      )}
                      {tinError && (
                        <p className="text-red-600 text-sm mt-1">{tinError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Customer Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register('customer_name', { required: 'Customer name is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base focus:outline-0"
                        placeholder=""
                        readOnly
                      />
                      {errors.customer_name && (
                        <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domain Name</label>
                      <input
                        {...register('domain_name')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter domain name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register('contact_name', { required: 'Contact name is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter contact name"
                      />
                      {errors.contact_name && (
                        <p className="text-red-600 text-sm mt-1">{errors.contact_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Phone <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register('contact_phone', {
                          required: 'Contact phone is required',
                          pattern: {
                            value: /^[0-9]{10,15}$/,
                            message: 'Invalid phone number (10-15 digits)',
                          },
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter contact phone"
                        type="tel"
                      />
                      {errors.contact_phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.contact_phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        {...register('contact_email', {
                          required: 'Contact email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address',
                          },
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter contact email"
                        type="email"
                      />
                      {errors.contact_email && (
                        <p className="text-red-600 text-sm mt-1">{errors.contact_email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deal Type</label>
                      <input
                        {...register('deal_type')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter deal type"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <input
                        {...register('status')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base bg-gray-100"
                        value="draft"
                        disabled
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        {...register('address')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter address"
                        rows="4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                      <textarea
                        {...register('billing_address')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter billing address"
                        rows="4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        {...register('description')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm sm:text-base"
                        placeholder="Enter description"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit(onSaveDraft)}
                    disabled={loadingSubmit || loadingTin}
                    className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base touch-manipulation ${
                      loadingSubmit || loadingTin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loadingSubmit ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={loadingSubmit || loadingTin}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base touch-manipulation ${
                      loadingSubmit || loadingTin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loadingSubmit ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {showSubmitConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h2 className="text-lg font-semibold mb-4">Confirm Submit</h2>
              <p className="mb-6">Are you sure submit this deal?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSubmit(onSubmit)();
                    setShowSubmitConfirm(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </div>
  );
};

export default AddDealAdmin;