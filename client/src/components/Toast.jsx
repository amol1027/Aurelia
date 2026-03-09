import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const TOAST_TYPES = {
    success: {
        icon: FaCheckCircle,
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
    },
    error: {
        icon: FaExclamationCircle,
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
    },
    info: {
        icon: FaInfoCircle,
        bg: 'bg-gradient-to-r from-primary-50 to-[#FFF5E0]',
        border: 'border-primary-200',
        iconColor: 'text-primary-600',
        textColor: 'text-warm-text',
    },
};

export default function Toast({ id, type = 'info', message, onClose, duration = 4000 }) {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => onClose(id), duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`min-w-[320px] max-w-md backdrop-blur-xl ${config.bg} border ${config.border}
                rounded-2xl shadow-warm-lg p-4 flex items-start gap-3`}
            role="alert"
            aria-live="polite"
        >
            <Icon className={`${config.iconColor} text-lg mt-0.5 flex-shrink-0`} aria-hidden="true" />
            <p className={`${config.textColor} text-sm font-medium flex-1 leading-relaxed`}>
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className={`${config.iconColor} hover:opacity-70 transition-opacity p-1 -mt-0.5 -mr-1 flex-shrink-0`}
                aria-label="Close notification"
            >
                <FaTimes className="text-sm" />
            </button>
        </motion.div>
    );
}

export function ToastContainer({ toasts, onClose }) {
    return (
        <div
            className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
            aria-label="Notifications"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} onClose={onClose} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
