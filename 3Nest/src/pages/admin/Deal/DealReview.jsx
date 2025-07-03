import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../../utils/apiPath';
import { useNavigate } from 'react-router-dom';

const DealReview = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Đảm bảo là manager mới hiển thị
    if (!token || !storedUser || storedUser.role_name !== 'manager') return;

    const fetchSubmittedCount = async () => {
      try {
        const res = await fetch(`${BASE_URL}/deals/count-submitted-deals`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const result = await res.json();

        if (res.ok && result?.mess?.toLowerCase().includes('deal')) {
          setMessage(result.mess);
          setShow(true);
        }
      } catch (err) {
        console.error('Failed to fetch count-submitted-deals:', err);
      }
    };

    fetchSubmittedCount();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Deal Review Notification</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
                setShow(false);
                navigate('/deals'); 
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
                Review
            </button>

        </div>
      </div>
    </div>
  );
};

export default DealReview;
