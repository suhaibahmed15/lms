
function ConfirmDialog({
    isOpen,
    title = "Are you sure?",
    message = "Do you want to continue with this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                {/* Header */}
                <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">
                        {title}
                    </h2>

                </div>

                {/* Message */}
                <p className="mb-6 text-sm leading-6 text-gray-500">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ConfirmDialog;
