function Loading({ message = "Loading..." }) {
    return (
        <div className="flex min-h-[250px] w-full flex-col items-center justify-center">
            {/* Loading Spinner */}
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-pink-500"></div>

            {/* Loading Message */}
            <p className="mt-4 text-sm font-medium text-zinc-400">
                {message}
            </p>
        </div>
    );
}

export default Loading;
