import { useCallback, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Loading from "../common/Loading";
import { getMenusByUser } from "../../services/menuService";
import {
    getUserId,
    isAuthenticated,
    AUTH_CHANGED_EVENT,
    MENUS_UPDATED_EVENT
} from "../../utils/auth";

function MainLayout({ children, user, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMenus = useCallback(async () => {
        if (!isAuthenticated()) {
            setMenus([]);
            setError("");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const userId = getUserId();

            if (!userId) {
                setMenus([]);
                setError("User information not found.");
                return;
            }

            const response = await getMenusByUser(userId);

            const menuData = Array.isArray(response)
                ? response
                : response?.data || [];

            const activeMenus = menuData
                .filter((menu) => menu.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            setMenus(activeMenus);
        } catch (err) {
            setMenus([]);
            setError(
                err.response?.data?.message ||
                "Unable to load navigation menus."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Load menus when layout mounts
    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    // Refresh menus whenever login/logout happens
    useEffect(() => {
        const handleAuthChanged = () => {
            fetchMenus();
        };

        window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);

        return () => {
            window.removeEventListener(
                AUTH_CHANGED_EVENT,
                handleAuthChanged
            );
        };
    }, [fetchMenus]);

    // Refresh menus when menu permissions are updated
    useEffect(() => {
        const handleMenusUpdated = () => {
            fetchMenus();
        };

        window.addEventListener(MENUS_UPDATED_EVENT, handleMenusUpdated);

        return () => {
            window.removeEventListener(
                MENUS_UPDATED_EVENT,
                handleMenusUpdated
            );
        };
    }, [fetchMenus]);

    if (!isAuthenticated()) {
        return null;
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#fff7f9] via-[#ffffff] to-[#fff0f5] text-zinc-900">

            {/* Background glowing gradients */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(244,114,182,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(251,113,133,0.12),transparent_50%)]" />

            {/* Desktop Sidebar */}
            <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
                <Sidebar menus={menus} />
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">

                    <div
                        className="absolute inset-0 bg-pink-950/25 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />

                    <div className="relative z-10 h-full">
                        <Sidebar
                            menus={menus}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">

                <Header
                    user={user}
                    onLogout={onLogout}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">

                    {loading ? (
                        <Loading message="Loading navigation..." />
                    ) : error ? (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    ) : (
                        children
                    )}

                </main>
            </div>
        </div>
    );
}

export default MainLayout;
