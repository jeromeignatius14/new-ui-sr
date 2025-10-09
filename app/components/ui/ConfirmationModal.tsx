import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Yes",
    cancelLabel = "No",
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 backdrop-blur-sm text-black">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
                <p className="text-center mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded transition duration-300"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition duration-300"
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;