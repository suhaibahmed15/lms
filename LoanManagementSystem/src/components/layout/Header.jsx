
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRole } from "../../services/roleService";

function Header({ user, onLogout, onMenuClick }) {
    const [showProfile, setShowProfile] = useState(false);
    const [roleName, setRoleName] = useState("Loading...");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRole = async () => {
            try {
                if (!user?.userId) {
                    setRoleName("Unknown Role");
                    return;
                }

                const response = await getMyRole();

                setRoleName(
                    response?.data?.name || "Unknown Role"
                );

            } catch (error) {
                console.error("Unable to load role:", error);
                setRoleName("Unknown Role");
            }
        };

        fetchRole();

    }, [user?.userId]);

    const handleLogout = () => {
        setShowProfile(false);

        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    const fullName =
        user?.fullName ||
        user?.name ||
        "User";

    return (
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6">

            {/* Left Section */}
            <div className="flex items-center gap-4">

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                <div>
                    <h1 className="text-lg font-bold text-gray-900">
                        Welcome Back
                    </h1>

                    <p className="hidden text-sm text-gray-500 sm:block">
                        Manage your loan operations efficiently.
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">

                {/* Notifications */}
                <button
                    type="button"
                    className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                    aria-label="Notifications"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 00-4 0v.3A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
                        />
                    </svg>

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500"></span>
                </button>

                {/* User Profile */}
                <div className="relative">

                    <button
                        type="button"
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                            {fullName.charAt(0).toUpperCase()}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold text-gray-800">
                                {fullName}
                            </p>

                            <p className="text-xs text-gray-500">
                                {roleName}
                            </p>
                        </div>

                        <span className="hidden text-gray-400 sm:block">
                            ▼
                        </span>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">

                            <div className="border-b border-gray-100 px-3 py-2">
                                <p className="text-sm font-semibold text-gray-800">
                                    {fullName}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {user?.email || ""}
                                </p>

                                <p className="mt-1 text-xs font-medium text-emerald-700">
                                    {roleName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Sign Out
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
