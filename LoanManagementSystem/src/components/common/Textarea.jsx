import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
    {
        label,
        name,
        value,
        onChange,
        placeholder,
        rows = 3,
        required = false,
        disabled = false,
        error,
        helperText,
        className = "",
        textareaClassName = "",
        ...props
    },
    ref
) {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                    {label}
                    {required && <span className="ml-1 text-pink-500">*</span>}
                </label>
            )}

            <textarea
                ref={ref}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                disabled={disabled}
                className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition duration-150 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 disabled:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                        : "border-zinc-200 hover:border-pink-300 focus:border-pink-500"
                } ${textareaClassName}`}
                {...props}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-500">{error}</p>
            )}

            {!error && helperText && (
                <p className="mt-1.5 text-xs text-zinc-500">{helperText}</p>
            )}
        </div>
    );
});

export default Textarea;
