import React, { useEffect, useState, useCallback } from 'react';
import { BASE_URL } from '../../utils/apiPath';

// Component Pagination không cần thay đổi, chỉ cần đảm bảo props truyền vào đúng
const Pagination = ({ page, total_pages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-gray-700">
        Page {page} of {total_pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === total_pages || total_pages === 0}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};


const Reports = () => {
  // --- BƯỚC 1: TỐI GIẢN STATE ---
  const [activityLog, setActivityLog] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho từng bộ lọc cụ thể
  const [userEmail, setUserEmail] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State cho phân trang
  const [page, setPage] = useState(1);
  const [total_pages, setTotalPages] = useState(0);
  const [limit] = useState(10);

  // Loại bỏ fetchUsers vì không cần dropdown nữa

  // --- BƯỚC 2: VIẾT LẠI HOÀN TOÀN LOGIC FETCH ---
  const fetchActivityLog = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Endpoint luôn cố định
    const endpoint = `${BASE_URL}/activities/activity-logs`;
    
    // Xây dựng params một cách linh hoạt
    const params = new URLSearchParams({
      page: page,
      limit: limit,
    });

    // Chỉ thêm param vào URL nếu nó có giá trị
    if (userEmail) params.append('user_email', userEmail);
    if (entity) params.append('entity', entity);
    if (startDate) params.append('start_date', new Date(startDate).toISOString());
    if (endDate) params.append('end_date', new Date(endDate).toISOString());

    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activity log');
      }

      const result = await response.json();
      setActivityLog(result.data || []);
      // Giả sử API trả về totalPages, nếu không có thì trả về 0
      setTotalPages(result.pagination?.total_pages || 0); 
    } catch (err) {
      console.error('Error fetching activity log:', err);
      setError(err.message || 'An error occurred while fetching activity log');
      setActivityLog([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, userEmail, entity, startDate, endDate]);


  // --- BƯỚC 3: SẮP XẾP LẠI USEEFFECT ---
  
  // useEffect này sẽ tự động gọi lại API mỗi khi page hoặc các bộ lọc thay đổi
  useEffect(() => {
    fetchActivityLog();
  }, [fetchActivityLog]); // Phụ thuộc vào hàm fetch đã được bọc bởi useCallback

  // Hàm xử lý khi nhấn nút tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset về trang 1, useEffect sẽ tự động gọi lại API
  };
  
  // Hàm reset bộ lọc
  const handleResetFilters = () => {
    setUserEmail('');
    setEntity('');
    setStartDate('');
    setEndDate('');
    setPage(1); 
  };


  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= total_pages) {
      setPage(newPage);
    }
  };
   console.log('999', startDate);

  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Activities Log Management</h1>

        {/* --- BƯỚC 4: ĐƠN GIẢN HÓA GIAO DIỆN BỘ LỌC --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch}>
            {/* Bỏ dropdown "Filter By", hiển thị tất cả các ô lọc */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">User Email</label>
                <input
                  type="email"
                  placeholder="e.g., user@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Entity</label>
                <input
                  type="text"
                  placeholder="e.g., deal, order"
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  {/* ... thead giữ nguyên ... */}
                  <thead>
                     <tr>
                       <th className="py-2 px-4 border-b text-left">User Email</th>
                       <th className="py-2 px-4 border-b text-left">IP</th>
                       <th className="py-2 px-4 border-b text-left">Description</th>
                       <th className="py-2 px-4 border-b text-left">Location</th>
                       <th className="py-2 px-4 border-b text-left">Target Type</th>
                       <th className="py-2 px-4 border-b text-left">Created At</th>
                     </tr>
                   </thead>
                  <tbody>
                    {/* Bỏ filteredActivityLog, chỉ dùng activityLog */}
                    {activityLog.length > 0 ? (
                      activityLog.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{log.user_email}</td>
                          <td className="py-2 px-4 border-b">{log.ip}</td>
                          <td className="py-2 px-4 border-b max-w-xs truncate">{log.activity_description}</td>
                          <td className="py-2 px-4 border-b">{log.location}</td>
                          <td className="py-2 px-4 border-b">{log.target_type}</td>
                          <td className="py-2 px-4 border-b">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">No activity logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Truyền đúng props cho Pagination */}
              {activityLog.length > 0 && (
                <Pagination 
                  page={page}
                  total_pages={total_pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;