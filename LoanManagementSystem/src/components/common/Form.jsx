export default function Form({
    onSubmit,
    error,
    success,
    children,
    className = "space-y-5",
    ...props
}) {
    return (
        <form onSubmit={onSubmit} className={className} {...props}>
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {success}
                </div>
            )}

            {children}
        </form>
    );
}
