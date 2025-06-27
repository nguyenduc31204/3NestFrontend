import React, { use, useEffect, useState } from 'react'
import Header from '../../components/layouts/Header'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { BASE_URL } from '../../utils/apiPath'
import { set } from 'react-hook-form'

const Reports = () => {
  const [activityLog, setActivityLog] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchActivityLog = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BASE_URL}/activity-log`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch activity log')
      }
      const result = await response.json();
      setActivityLog(result.data || [])
      console.log('Activity Log:', result.data)
  } catch (err) {
    console.error('Error fetching activity log:', err)
    setError(err.message || 'An error occurred while fetching activity log')
  } finally {
    setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityLog()
  }, [])
  return (
    <>
      <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Activity Log Manager</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">ID</th>
                      <th className="py-2 px-4 border-b text-left">Time</th>
                      <th className="py-2 px-4 border-b text-left">...</th>
                      <th className="py-2 px-4 border-b text-left">...</th>
                      <th className="py-2 px-4 border-b text-left">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{log.id}</td>
                        <td className="py-2 px-4 border-b">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-2 px-4 border-b">{log.user}</td>
                        <td className="py-2 px-4 border-b">{log.action}</td>
                        <td className="py-2 px-4 border-b">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

         

        </div>
      
    </>
  )
}

export default Reports
