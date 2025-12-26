const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
