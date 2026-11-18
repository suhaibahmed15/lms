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
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-sm text-zinc-400">
                        {description}
                    </p>
                )}
            </div>

            {/* Action Button */}
            {showButton && buttonText && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400 hover:shadow-orange-500/30"
                >
                    <span className="text-lg">+</span>
                    {buttonText}
                </button>
            )}
        </div>
    );
}

export default PageHeader;
