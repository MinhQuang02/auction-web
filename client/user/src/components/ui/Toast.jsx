import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Function to show toast
    // Type: 'success', 'error', 'info' (default)
    const addToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const ToastItem = ({ message, type, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Slide up animation trigger
        requestAnimationFrame(() => setIsVisible(true));

        // Auto dismiss
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onRemove, 300); // Wait for fade out
        }, 3000);

        return () => clearTimeout(timer);
    }, [onRemove]);

    // Theme color: #AE9B84
    // Success/Info use Theme. Error uses Red? Or user wants "mau vang nau chu dao" for background?
    // Request: "màu nền của thông báo đó sẽ là màu vàng nâu chủ đạo của web"
    // So ALL toasts are Brown/Gold. Maybe icon changes?

    return (
        <div
            className={`
        flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl text-white min-w-[300px] max-w-sm
        transition-all duration-300 transform 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        bg-[#AE9B84]
      `}
        >
            {/* Icon based on type? User wants uniform background. I'll add simple status icon */}
            {type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            <div className="font-medium text-sm leading-tight">{message}</div>
            <button onClick={() => { setIsVisible(false); setTimeout(onRemove, 300); }} className="ml-auto opacity-75 hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
