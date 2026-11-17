
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
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>

            {/* Action Button */}
            {showButton && buttonText && (
                <button
                    type="button"
                    onClick={onButtonClick}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                >
                    <span className="text-lg">+</span>
                    {buttonText}
                </button>
            )}

        </div>
    );
}

export default PageHeader;
