import React, { useState, useEffect, useCallback, use } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FiUser, FiBriefcase, FiPhone, FiSave, FiMail, FiCheckCircle, FiAlertTriangle, FiCamera } from 'react-icons/fi';
import { BASE_URL } from '../../../utils/apiPath';
import { useAuth } from '../../../context/AuthContext';


const FormField = ({ icon: Icon, label, name, register, errors, rules, ...rest }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="w-5 h-5 text-gray-400" />
      </span>
      <input
        id={name}
        {...register(name, rules)}
        {...rest}
        className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out 
                    ${errors[name] 
                      ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
      />
    </div>
    {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name].message}</p>}
  </div>
);

const ToggleSwitch = ({ label, name, register, disabled }) => (
  <>
    <style>{`
        input:checked ~ .dot {
            transform: translateX(100%);
            background-color: #2563eb; /* bg-blue-600 */
        }
        input:checked ~ .block {
            background-color: #93c5fd; /* bg-blue-300 */
        }
    `}</style>
    <label htmlFor={name} className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <input id={name} type="checkbox" className="sr-only" {...register(name)} disabled={disabled} />
        <div className="block bg-gray-200 w-14 h-8 rounded-full transition-colors"></div>
        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div>
      </div>
    </label>
  </>
);

const Alert = ({ type, message }) => {
  if (!message) return null;
  const isError = type === 'error';
  const config = {
    bgColor: isError ? 'bg-red-50' : 'bg-green-50',
    borderColor: isError ? 'border-red-500' : 'border-green-500',
    textColor: isError ? 'text-red-700' : 'text-green-700',
    Icon: isError ? FiAlertTriangle : FiCheckCircle,
  };

  return (
    <div className={`p-4 mb-4 border-l-4 rounded-r-lg ${config.bgColor} ${config.borderColor}`} role="alert">
      <div className="flex items-center">
        {/* <Icon className={`w-5 h-5 mr-3 ${config.textColor}`} /> */}
        <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
    <div className="p-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <div className="mx-auto bg-gray-300 rounded-full h-32 w-32"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);


const Profile = () => {
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        user_id: user.user_id,
        user_name: user.name || user.user_name || '',
        company_name: user.company_name || '',
        status: user.status || false,
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  console.log('User Info222222222:', user);

//   useEffect(() => {
//   if (user) {
//     reset({
//       user_name: user.name || user.user_name || '',
//       company_name: user.company_name || '',
//     });
//   }
// }, [user, reset]);

  const onSubmit = useCallback(async (data) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    const toastId = toast.loading('Saving changes...');
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/users/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(data),
      });
      console.log('3333333333:', data); 

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Failed to update user info');

      toast.success('Profile updated successfully!', { id: toastId });
    //   setSuccess('Profile updated successfully.');
      await refreshUser(); 

    } catch (err) {
      toast.error(err.message || 'An error occurred.', { id: toastId });
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshUser]);

  if (isAuthLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="my-4 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="content py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 mt-1">Manage your profile and account settings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=random&bold=true&color=fff`}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition shadow">
                    <FiCamera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{user?.user_email}</p>
                <span className="mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                  {user?.role_name || 'Role'}
                </span>
            </div>
            
            <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h3>
              <Alert type="error" message={error} />
              <Alert type="success" message={success} />
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  icon={FiUser}
                  label="User Name"
                  name="user_name"
                  register={register}
                  errors={errors}
                  rules={{ required: 'User name is required' }}
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                />
                <FormField
                  icon={FiBriefcase}
                  label="Company Name"
                  name="company_name"
                  register={register}
                  errors={errors}
                  placeholder="Enter company name"
                  disabled={isSubmitting}
                />
                <FormField
                  icon={FiPhone}
                  label="Phone Number"
                  name="phone"
                  register={register}
                  errors={errors}
                  rules={{
                    required: 'Phone number is required',
                    pattern: { value: /^\+?\d{10,15}$/, message: 'Invalid phone number format' }
                  }}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                />
                
                <ToggleSwitch 
                  label="Active Status"
                  name="status"
                  register={register}
                  disabled={isSubmitting}
                />

                <div className="flex justify-end pt-4 space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)} 
                      className="flex items-center justify-center px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-75 transition-colors"
                      disabled={isSubmitting}
                    >
                      <FiSave className="w-5 h-5 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;