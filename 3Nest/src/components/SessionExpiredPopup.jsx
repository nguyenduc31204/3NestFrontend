

const SessionExpiredPopup = ({ isOpen, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">Session expired</h2>
        <p className="mb-6">Your session has ended. Please log in again.</p>
        <button
          onClick={onConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Log back in
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredPopup;