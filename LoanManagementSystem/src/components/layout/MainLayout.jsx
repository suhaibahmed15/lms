
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Loading from "../common/Loading";
import { getMenusByUser } from "../../services/menuService";
import { getUserId } from "../../utils/auth";

function MainLayout({ children, user, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                setLoading(true);
                setError("");

                const userId = getUserId();

                if (!userId) {
                    setError("User information not found.");
                    return;
                }

                const response = await getMenusByUser(userId);

                // API returns menu array directly
                const menuData = Array.isArray(response)
                    ? response
                    : response.data || [];

                const activeMenus = menuData
                    .filter((menu) => menu.isActive)
                    .sort(
                        (a, b) => a.displayOrder - b.displayOrder
                    );

                setMenus(activeMenus);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load navigation menus."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar menus={menus} />
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">

                    <div
                        className="absolute inset-0 bg-black/40"
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
            <div className="flex min-w-0 flex-1 flex-col">

                <Header
                    user={user}
                    onLogout={onLogout}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

                    {loading ? (
                        <Loading message="Loading navigation..." />
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
