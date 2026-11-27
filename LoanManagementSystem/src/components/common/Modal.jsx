import { useEffect } from "react";
import { X } from "lucide-react";

const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-[96vw]"
};

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    maxWidth = "lg",
    closeOnEsc = true,
    closeOnClickOutside = true,
    className = "",
    bodyClassName = ""
}) {
    useEffect(() => {
        if (!isOpen || !closeOnEsc) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeOnEsc, onClose]);

    // Prevent background body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const widthClass = maxWidths[maxWidth] || maxWidths.lg;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-pink-950/25 backdrop-blur-sm transition-all"
            onClick={closeOnClickOutside ? onClose : undefined}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`relative flex flex-col w-full ${widthClass} max-h-[92vh] rounded-2xl border border-pink-200/90 bg-white shadow-2xl shadow-pink-500/10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Header */}
                {(title || onClose) && (
                    <div className="flex shrink-0 items-center justify-between border-b border-pink-100 px-6 py-4.5 bg-gradient-to-r from-pink-50/70 via-white to-pink-50/30">
                        <div className="pr-4">
                            {title && (
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
                                    {title}
                                </h2>
                            )}

                            {subtitle && (
                                <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="shrink-0 rounded-xl p-2 text-zinc-400 transition hover:bg-pink-100/60 hover:text-pink-600"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Scrollable Body - Never stretches off screen */}
                <div className={`flex-1 overflow-y-auto px-6 py-5 overscroll-contain custom-scrollbar bg-white text-zinc-800 ${bodyClassName}`}>
                    {children}
                </div>

                {/* Optional Fixed Footer */}
                {footer && (
                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-pink-100 px-6 py-3.5 bg-pink-50/40">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
