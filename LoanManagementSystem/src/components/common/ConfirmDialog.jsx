import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
    isOpen,
    title = "Are you sure?",
    message = "Do you want to continue with this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pink-950/25 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl shadow-pink-500/10">
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
                        <AlertTriangle size={24} />
                    </div>

                    <h2 className="text-lg font-bold text-zinc-900">
                        {title}
                    </h2>
                </div>

                {/* Message */}
                <p className="mb-6 text-sm leading-6 text-zinc-600">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        loading={isLoading}
                        loadingText="Processing..."
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
