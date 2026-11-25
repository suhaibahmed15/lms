
import {
    createElement,
    forwardRef,
    isValidElement
} from "react";

import { Loader2 } from "lucide-react";

const variants = {
    primary:
        "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-orange-400 border border-orange-500/30 active:scale-[0.98]",
    secondary:
        "border border-white/10 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.10] hover:text-white active:scale-[0.98]",
    danger:
        "border border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 active:scale-[0.98]",
    outline:
        "border border-orange-500/40 text-orange-400 hover:bg-orange-500/15 hover:border-orange-500/70 active:scale-[0.98]",
    ghost:
        "text-zinc-400 hover:bg-white/10 hover:text-white active:scale-[0.98]",
    success:
        "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 active:scale-[0.98]"
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
    