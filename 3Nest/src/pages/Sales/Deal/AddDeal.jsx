import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import { BASE_URL } from '../../../utils/apiPath';
import Header from '../../../components/layouts/Header';
import DashboardLayout from '../../../components/layouts/DashboardLayout';


const useUser = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      toast.error('Authentication required. Redirecting to login.');
      navigate('/login');
    }
  }, [navigate]);
  return user;
};


const AddDealPage = () => {
  const navigate = useNavigate();
  const user = useUser();

  //--- State Management ---
  const [tinError, setTinError] = useState(null);
  const [loadingTin, setLoadingTin] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      deal_type: '', description: '', tax_indentification_number: '',
      customer_name: '', domain_name: '', contact_name: '',
      contact_email: '', contact_phone: '', address: '', billing_address: '',
    },
  });

  const taxIndentificationNumber = watch('tax_indentification_number');


  useEffect(() => {
    if (!taxIndentificationNumber || taxIndentificationNumber.length < 10) {
      setTinError(taxIndentificationNumber ? 'Tax code must be at least 10 characters' : null);
      setValue('customer_name', '');
      setValue('address', '');
      return;
    }
    
    setTinError(null);

    const validateTin = async () => {
      setLoadingTin(true);
      try {
        const response = await fetch(`https://api.vietqr.io/v2/business/${taxIndentificationNumber}`);
        const result = await response.json();
        if (result.code === '00' && result.data) {
          setValue('customer_name', result.data.name || '');
          setValue('address', result.data.address || '');
          setTinError(null);
        } else {
          setTinError(result.desc || 'Invalid tax code');
          setValue('customer_name', '');
          setValue('address', '');
        }
      } catch (err) {
        setTinError('Error while verifying tax code');
      } finally {
        setLoadingTin(false);
      }
    };

    const debounce = setTimeout(validateTin, 500);
    return () => clearTimeout(debounce);
  }, [taxIndentificationNumber, setValue]);


  const handleSaveDeal = async (data, status) => {
    if (tinError) {
      toast.error('Please correct the tax code error before saving.');
      return;
    }

    setLoadingSubmit(true);
    const loadingToast = toast.loading(`Đang ${status === 'draft' ? 'draft' : 'Submit'}...`);

    try {
      const payload = { ...data, status };
      const response = await fetch(`${BASE_URL}/deals/create-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'An error occurred, the tax code may already exist.');
      }
      
      toast.dismiss(loadingToast);
      toast.success(`Already ${status === 'draft' ? 'draft' : 'submit'} deal success!`);

      navigate(`/deals/edit/${result.data.deal_id}`);

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const onSaveDraft = (data) => handleSaveDeal(data, 'draft');
  const onSubmit = (data) => handleSaveDeal(data, 'submitted');

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Initializing...</div>;
  }
  
  return (
    <>
      <Header />
      {/* <DashboardLayout activeMenu='08'> */}
        <Toaster position="top-right" reverseOrder={false} />
        <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content py-6">
            <div className="page-header mb-8">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Add New Deal</h1>
              <div className="text-sm text-gray-500">
                <a href="/dashboard" className="hover:underline">Dashboard</a> / <a href="/deals" className="hover:underline">Deals</a> / Add
              </div>
            </div>

            <form className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6 border-b pb-4">Deal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* CỘT TRÁI */}
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Tax ID<span className="text-red-600">*</span></label>
                      <div className="relative">
                        <input 
                          {...register('tax_indentification_number', { required: 'Tax ID is required', minLength: { value: 10, message: 'Tax code must be at least 10 characters' } })}
                          className={`mt-1 block w-full border rounded-md shadow-sm p-2 ${tinError || errors.tax_indentification_number ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Enter tax code to autofill"
                          disabled={loadingTin || loadingSubmit}
                        />
                        {loadingTin && <div className="absolute right-3 top-3 animate-spin h-5 w-5 text-gray-500 border-2 border-t-blue-500 rounded-full"></div>}
                      </div>
                      {errors.tax_indentification_number && <p className="text-red-600 text-sm mt-1">{errors.tax_indentification_number.message}</p>}
                      {tinError && <p className="text-red-600 text-sm mt-1">{tinError}</p>}
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 out">Customer Name<span className="text-red-600">*</span></label>
                      <input 
                        {...register('customer_name', { required: 'Customer name is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 outline-0"
                        readOnly
                      />
                      {errors.customer_name && <p className="text-red-600 text-sm mt-1">{errors.customer_name.message}</p>}
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Domain Name</label>
                      <input {...register('domain_name')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter domain name" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Name<span className="text-red-600">*</span></label>
                      <input {...register('contact_name', { required: 'Contact name is required' })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter contact name" />
                      {errors.contact_name && <p className="text-red-600 text-sm mt-1">{errors.contact_name.message}</p>}
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Phone<span className="text-red-600">*</span></label>
                      <input type="tel" {...register('contact_phone', { required: 'Phone number is required', pattern: { value: /^[0-9]{10,15}$/, message: 'Invalid phone number (10-15 digits)' } })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter contact phone" />
                      {errors.contact_phone && <p className="text-red-600 text-sm mt-1">{errors.contact_phone.message}</p>}
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Email<span className="text-red-600">*</span></label>
                      <input type="email" {...register('contact_email', { required: 'Contact email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter contact email" />
                      {errors.contact_email && <p className="text-red-600 text-sm mt-1">{errors.contact_email.message}</p>}
                  </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Deal Type</label>
                      <input {...register('deal_type')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter deal type" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea {...register('address')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4" placeholder="Address will be filled in automatically according to tax code" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                      <textarea {...register('billing_address')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4" placeholder="Enter billing address" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea {...register('description')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4" placeholder="Enter description" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <button type="button" onClick={handleSubmit(onSaveDraft)} disabled={loadingSubmit || loadingTin}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 font-medium">
                  {loadingSubmit ? 'Saving...' : 'Save as Draft'}
                </button>
                <button type="button" onClick={() => setShowSubmitConfirm(true)} disabled={loadingSubmit || loadingTin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
                  {loadingSubmit ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {showSubmitConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Confirm Submission</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to submit this deal?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSubmit(onSubmit)();
                    setShowSubmitConfirm(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      {/* </DashboardLayout> */}
    </>
  );
};

export default AddDealPage;