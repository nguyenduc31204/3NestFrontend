import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { decodeToken, validateEmail } from '../../utils/help'
import { API_PATHS } from '../../utils/apiPath'
import axiosInstance from '../../utils/axiosIntance'
import Input from '../../components/input/Input'

const Login = () => {
  const [user_email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateEmail(user_email)) {
      setError('Vui lòng nhập email hợp lệ')
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    setError('')

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        user_email,
        password
      })

      const { access_token } = response.data
      if (!access_token) {
        setError('Đăng nhập không thành công. Token không tồn tại.')
        return
      }

      const decoded = decodeToken(access_token)
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("role", decoded.role) 
      
      console.log("Decoded token:", decoded)
      
      if (response.status === 200) {
        switch (decoded?.role?.toLowerCase()) { 
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'sales':
            navigate('/sales/products')
            break
          case 'channel':
            navigate('/channel/products')
            break
          default:
            navigate('/')
        }
      } else {
        setError('Đăng nhập không thành công. Vui lòng thử lại.')
      }

    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng thử lại.')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10'>
      <div className='w-full max-w-md bg-white shadow-md rounded-xl p-6 md:p-8'>
        <h3 className='text-2xl font-bold text-gray-800 text-center'>Welcome</h3>
        <p className='text-sm text-gray-600 text-center mt-1 mb-6'>Fill in the information to log in</p>
        <form onSubmit={handleLogin} className='space-y-4'>
          <Input
            value={user_email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abc@example.com"
            label="Email"
            type="text"
          />

          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            label="password"
            type="password"
          />

          {error && (
            <p className='text-red-500 text-sm'>{error}</p>
          )}

          <button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition duration-200'
          >
            Log in
          </button>

          <p className='text-sm text-center text-gray-700'>
            <Link to='/forgotPassword' className='text-blue-600 hover:underline ml-1'>Forgot Password?</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
