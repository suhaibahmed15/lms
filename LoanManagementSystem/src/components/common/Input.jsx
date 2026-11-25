
import {
    createElement,
    forwardRef,
    isValidElement
} from "react";

const renderIcon = (Icon) => {
    if (!Icon) return null;

    // Already rendered JSX element, e.g. password toggle button
    if (isValidElement(Icon)) {
        return Icon;
    }

    // Component type, including Lucide forwardRef icons
    return createElement(Icon, { size: 18 });
};

const Input = forwardRef(function Input(
    {
        label,
        id,
        name,
        type = "text",
        value,
        onChange,
        placeholder,
        required = false,
        disabled = false,
        error,
        helperText,
        icon: Icon,
        iconRight: IconRight,
        className = "",
        inputClassName = "",
        ...props
    },
    ref
) {
    const inputId = id || name;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-sm font-medium text-zinc-300"
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-orange-400">*</span>
                    )}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                        {renderIcon(Icon)}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full rounded-xl border bg-white/[0.07] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition duration-150 focus:bg-white/[0.10] focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${Icon ? "pl-10" : ""
                        } ${IconRight ? "pr-10" : ""} ${error
                            ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/15"
                            : "border-white/10 focus:border-orange-500/70 focus:ring-orange-500/10"
                        } ${inputClassName}`}
                    {...props}
                />

                {IconRight && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500">
                        {renderIcon(IconRight)}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-400">
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p className="mt-1.5 text-xs text-zinc-500">
                    {helperText}
                </p>
            )}
        </div>
    );
});

export default Input;
