import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { getMyRole } from "../../services/roleService";
import { logoutUser } from "../../utils/auth";

function Header({ user, onLogout, onMenuClick }) {
    const [showProfile, setShowProfile] = useState(false);
    const [roleName, setRoleName] = useState("Loading...");

    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const fetchRole = async () => {
            try {
                if (!user?.userId) {
                    if (isMounted) setRoleName("Unknown Role");
                    return;
                }

                const response = await getMyRole();

                if (isMounted) {
                    setRoleName(response?.data?.name || "Unknown Role");
                }
            } catch (error) {
                console.error("Unable to load role:", error);
                if (isMounted) setRoleName("Unknown Role");
            }
        };

        fetchRole();

        return () => {
            isMounted = false;
        };
    }, [user?.userId]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleLogout = () => {
        setShowProfile(false);

        if (onLogout) {
            onLogout();
        } else {
            logoutUser();
            navigate("/login", { replace: true });
        }
    };

    const fullName = user?.fullName || user?.name || "User";

    return (
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-pink-100 bg-white/90 px-4 backdrop-blur-xl sm:px-6 shadow-sm">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-xl border border-pink-200/80 bg-pink-50/50 p-2 text-zinc-600 transition hover:bg-pink-100 hover:text-pink-700 lg:hidden"
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
                    <h1 className="text-lg font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                        <span>Welcome Back</span>
                        <span className="text-pink-500">👋</span>
                    </h1>

                    <p className="hidden text-xs text-zinc-500 sm:block">
                        Manage your loan operations securely and efficiently.
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                    type="button"
                    className="relative rounded-xl border border-pink-200/80 bg-pink-50/50 p-2.5 text-zinc-500 transition hover:border-pink-300 hover:bg-pink-100 hover:text-pink-600"
                    aria-label="Notifications"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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

                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setShowProfile((prev) => !prev)}
                        className="flex items-center gap-3 rounded-xl border border-pink-200/80 bg-pink-50/30 px-2.5 py-1.5 transition hover:border-pink-300 hover:bg-pink-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-bold text-white shadow-md shadow-pink-500/25">
                            {fullName.charAt(0).toUpperCase()}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold text-zinc-900">
                                {fullName}
                            </p>

                            <p className="text-xs text-pink-600 font-medium">
                                {roleName}
                            </p>
                        </div>

                        <ChevronDown
                            size={16}
                            className={`hidden text-zinc-400 transition-transform sm:block ${
                                showProfile ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-14 z-50 w-60 rounded-2xl border border-pink-200 bg-white p-2 shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
                            <div className="border-b border-pink-100 bg-pink-50/40 rounded-xl px-3 py-2.5">
                                <p className="text-sm font-semibold text-zinc-900">
                                    {fullName}
                                </p>

                                <p className="truncate text-xs text-zinc-500">
                                    {user?.email || ""}
                                </p>

                                <span className="mt-2 inline-block rounded-full border border-pink-200 bg-pink-100/70 px-2.5 py-0.5 text-[11px] font-semibold text-pink-700">
                                    {roleName}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-pink-600 transition hover:bg-pink-50 hover:text-pink-700"
                            >
                                <LogOut size={16} />
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
