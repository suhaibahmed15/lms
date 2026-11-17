
function Loading({ message = "Loading..." }) {
    return (
        <div className="flex min-h-[250px] w-full flex-col items-center justify-center">

            {/* Loading Spinner */}
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-700"></div>

            {/* Loading Message */}
            <p className="mt-4 text-sm font-medium text-gray-500">
                {message}
            </p>

        </div>
    );
}

export default Loading;
