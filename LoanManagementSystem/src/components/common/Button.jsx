
import {
    createElement,
    forwardRef,
    isValidElement
} from "react";

import { Loader2 } from "lucide-react";

const variants = {
    primary:
        "bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/25 hover:from-pink-500 hover:to-rose-300 border border-pink-400/40 active:scale-[0.98]",
    secondary:
        "border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:border-pink-500/30 active:scale-[0.98]",
    danger:
        "border border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 active:scale-[0.98]",
    outline:
        "border border-pink-500/50 text-pink-400 hover:bg-pink-500/15 hover:border-pink-400 active:scale-[0.98]",
    ghost:
        "text-white/80 hover:bg-white/10 hover:text-white active:scale-[0.98]",
    success:
        "border border-pink-500/30 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25 hover:text-white active:scale-[0.98]"
};

const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-5 py-3 text-base rounded-xl gap-2.5"
};

// Supports JSX elements and Lucide forwardRef icons
const renderIcon = (Icon, iconSize) => {
    if (!Icon) return null;

    if (isValidElement(Icon)) {
        return Icon;
    }

    return createElement(Icon, { size: iconSize });
};

const Button = forwardRef(function Button(
    {
        children,
        type = "button",
        variant = "primary",
        size = "md",
        loading = false,
        loadingText,
        icon: Icon,
        iconRight: IconRight,
        disabled = false,
        className = "",
        ...props
    },
    ref
) {
    const baseStyle =
        "inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none select-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

    const variantStyle = variants[variant] || variants.primary;
    const sizeStyle = sizes[size] || sizes.md;

    const iconSize = size === "sm" ? 14 : 16;

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2
                        size={iconSize}
                        className="animate-spin"
                    />
                    <span>{loadingText || children}</span>
                </>
            ) : (
                <>
                    {renderIcon(Icon, iconSize)}

                    {children}

                    {renderIcon(IconRight, iconSize)}
                </>
            )}
        </button>
    );
});

export default Button;
    