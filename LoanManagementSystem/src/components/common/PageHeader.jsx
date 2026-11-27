function PageHeader({
    title,
    description,
    buttonText,
    onButtonClick,
    showButton = true
}) {
    return (
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            {/* Page Information */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-sm text-zinc-500">
                        {description}
                    </p>
                )}
            </div>

            {/* Action Button */}
            {showButton && buttonText && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-600 hover:to-rose-600 hover:shadow-pink-500/40"
                >
                    <span className="text-lg">+</span>
                    {buttonText}
                </button>
            )}
        </div>
    );
}

export default PageHeader;
