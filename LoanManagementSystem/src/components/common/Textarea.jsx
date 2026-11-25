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
                    className="mb-1.5 block text-sm font-medium text-zinc-300"
                >
                    {label}
                    {required && <span className="ml-1 text-orange-400">*</span>}
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
                className={`w-full resize-none rounded-xl border bg-white/[0.07] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition duration-150 focus:bg-white/[0.10] focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                    error
                        ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/15"
                        : "border-white/10 focus:border-orange-500/70 focus:ring-orange-500/10"
                } ${textareaClassName}`}
                {...props}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}

            {!error && helperText && (
                <p className="mt-1.5 text-xs text-zinc-500">{helperText}</p>
            )}
        </div>
    );
});

export default Textarea;
