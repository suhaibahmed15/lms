import {
    createElement,
    forwardRef,
    isValidElement
} from "react";

import { Loader2 } from "lucide-react";

const variants = {
    primary:
        "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 border border-pink-400/30 active:scale-[0.98]",
    secondary:
        "border border-pink-200 bg-white text-zinc-700 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300 shadow-sm active:scale-[0.98]",
    danger:
        "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 active:scale-[0.98]",
    outline:
        "border border-pink-400 text-pink-600 hover:bg-pink-50 hover:border-pink-500 active:scale-[0.98]",
    ghost:
        "text-zinc-600 hover:bg-pink-50 hover:text-pink-600 active:scale-[0.98]",
    success:
        "border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 active:scale-[0.98]"
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
                    {Icon && renderIcon(Icon, iconSize)}
                    {children}
                    {IconRight && renderIcon(IconRight, iconSize)}
                </>
            )}
        </button>
    );
});

export default Button;
