import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
    {
        label,
        name,
        value,
        onChange,
        options = [],
        placeholder,
        required = false,
        disabled = false,
        error,
        helperText,
        icon: Icon,
        children,
        className = "",
        selectClassName = "",
        ...props
    },
    ref
) {
    return (
        <div className={`w-full min-w-0 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700"
                >
                    {label}
                    {required && <span className="ml-1 text-pink-500">*</span>}
                </label>
            )}

            <div className="relative w-full min-w-0">
                {Icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-pink-500">
                        {typeof Icon === "function" ? <Icon size={16} /> : Icon}
                    </div>
                )}

                <select
                    ref={ref}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    style={{ colorScheme: "light" }}
                    className={`w-full max-w-full min-w-0 appearance-none truncate text-ellipsis rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition duration-150 focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/15 disabled:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 ${
                        Icon ? "pl-10" : ""
                    } ${
                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-zinc-200 hover:border-pink-300"
                    } ${selectClassName}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" className="bg-white text-zinc-400 py-2">
                            {placeholder}
                        </option>
                    )}

                    {children
                        ? children
                        : options.map((opt) => (
                              <option
                                  key={opt.value}
                                  value={opt.value}
                                  disabled={opt.disabled}
                                  className="bg-white text-zinc-900 py-2"
                              >
                                  {opt.label}
                              </option>
                          ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400">
                    <ChevronDown size={16} />
                </div>
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-500">{error}</p>
            )}

            {!error && helperText && (
                <p className="mt-1.5 text-xs text-zinc-500">{helperText}</p>
            )}
        </div>
    );
});

export default Select;
