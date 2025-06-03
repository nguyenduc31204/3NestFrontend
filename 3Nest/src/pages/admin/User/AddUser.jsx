import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../../utils/apiPath'

const AddUser = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    company_name: '',
    password: '',
    role: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${BASE_URL}/users/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to create user')
      navigate('/users')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New User</h2>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
            <input
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            placeholder="Enter user name"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            placeholder="Enter email"
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Enter company"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Enter password"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <option value="">Select role</option>
            {/* <option value="admin">Admin</option> */}
            <option value="manager">Manager</option>
            <option value="sales">Sales</option>
            <option value="channel">Channel</option>
            </select>
        </div>

        <div className="text-right">
            <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors"
            >
            Create User
            </button>
        </div>
    </form>

  )
}

export default AddUser
