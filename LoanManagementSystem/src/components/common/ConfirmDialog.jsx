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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-pink-500/20 bg-neutral-950 p-6 shadow-2xl shadow-pink-500/5">
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/15 text-red-400">
                        <AlertTriangle size={24} />
                    </div>

                    <h2 className="text-lg font-bold text-white">
                        {title}
                    </h2>
                </div>

                {/* Message */}
                <p className="mb-6 text-sm leading-6 text-zinc-400">
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
