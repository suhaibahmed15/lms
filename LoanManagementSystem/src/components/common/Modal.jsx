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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm transition-all"
            onClick={closeOnClickOutside ? onClose : undefined}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`relative flex flex-col w-full ${widthClass} max-h-[92vh] rounded-2xl border border-slate-700/80 bg-[#0b1329] shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Header */}
                {(title || onClose) && (
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-800/90 px-6 py-4.5 bg-[#0f172a]/95 backdrop-blur-md">
                        <div className="pr-4">
                            {title && (
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                                    {title}
                                </h2>
                            )}

                            {subtitle && (
                                <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Scrollable Body - Never stretches off screen */}
                <div className={`flex-1 overflow-y-auto px-6 py-5 overscroll-contain custom-scrollbar ${bodyClassName}`}>
                    {children}
                </div>

                {/* Optional Fixed Footer */}
                {footer && (
                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-800/90 px-6 py-3.5 bg-[#0f172a]/95">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
