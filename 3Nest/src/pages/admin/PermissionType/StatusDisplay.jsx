import React from 'react';

const StatusDisplay = ({ status, error, dataLength, children }) => {
    if (status === 'loading') {
        return <div className="p-8 text-center text-gray-500 font-semibold">Loading data...</div>;
    }

    if (status === 'error') {
        return (
            <div className="p-4 m-4 bg-red-50 border-l-4 border-red-400">
                <p className="text-sm text-red-800 font-semibold">Error fetching data</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
        );
    }
    
    if (status === 'success' && dataLength === 0) {
        return <div className="p-8 text-center text-gray-500">No permission types found.</div>;
    }

    return children;
};

export default StatusDisplay;