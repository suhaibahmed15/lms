
import { useLocation, useNavigate } from "react-router-dom";
import {
    Wallet,
    FileText,
    LayoutDashboard,
    Users,
    Settings,
    ShieldCheck,
    CircleHelp,
    Folder,
    CreditCard,
    Bell,
    UserRound,
    ClipboardList,
    FileCheck,
    CalendarDays,
    ListChecks,
    UserCheck,
    CheckCircle,
    Landmark,
    ClipboardCheck,
    CalendarCheck
} from "lucide-react";

const getMenuIcon = (iconName) => {
    const icons = {
        wallet: Wallet,
        "file-text": FileText,
        dashboard: LayoutDashboard,
        users: Users,
        settings: Settings,
        shield: ShieldCheck,
        help: CircleHelp,
        folder: Folder,
        creditcard: CreditCard,
        "credit-card": CreditCard,
        bell: Bell,
        user: UserRound,
        "clipboard-list": ClipboardList,
        "file-check": FileCheck,
        "calendar-days": CalendarDays,
        "list-check": ListChecks,
        "user-check": UserCheck,
        "check-circle": CheckCircle,
        landmark: Landmark,
        "clipboard-check": ClipboardCheck,
        "calendar-check": CalendarCheck,
        "wallet-cards": Wallet
    };

    const IconComponent = icons[iconName?.toLowerCase()];

    return IconComponent ? <IconComponent size={19} /> : null;
};

function Sidebar({ menus = [], onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (route) => {
        if (!route) return;

        navigate(route);

        if (onClose) {
            onClose();
        }
    };

    const activeMenus = menus.filter(
        (menu) => menu.isActive && menu.route
    );

    const parentMenus = menus
        .filter((menu) => menu.parentMenuId == null)
        .sort((a, b) => a.displayOrder - b.displayOrder);

    const getChildMenus = (parentId) => {
        return activeMenus
            .filter((menu) => menu.parentMenuId === parentId)
            .sort((a, b) => a.displayOrder - b.displayOrder);
    };

    // Find child menus whose parent is not included in the user's menus.
    const orphanMenus = activeMenus
        .filter(
            (menu) =>
                menu.parentMenuId != null &&
                !menus.some((parent) => parent.id === menu.parentMenuId)
        )
        .sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">

            <div className="flex h-20 items-center border-b border-gray-200 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-xl font-bold text-white">
                    L
                </div>

                <div className="ml-3">
                    <h2 className="text-lg font-bold text-gray-900">
                        LoanFlow
                    </h2>

                    <p className="text-xs text-gray-500">
                        Management System
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-6">

                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Main Menu
                </p>

                {parentMenus.map((parent) => {
                    const childMenus = getChildMenus(parent.id);

                    return (
                        <div key={parent.id}>

                            <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-800">
                                {parent.icon && (
                                    <span className="text-gray-600">
                                        {getMenuIcon(parent.icon)}
                                    </span>
                                )}

                                <span>{parent.name}</span>
                            </div>

                            <div className="mt-1 space-y-1">

                                {childMenus.map((child) => {
                                    const isActive =
                                        location.pathname === child.route;

                                    return (
                                        <button
                                            key={child.id}
                                            type="button"
                                            onClick={() =>
                                                handleNavigation(child.route)
                                            }
                                            className={`flex w-full items-center gap-3 rounded-xl py-3 pl-10 pr-4 text-left text-sm font-medium transition ${
                                                isActive
                                                    ? "bg-emerald-700 text-white shadow-sm"
                                                    : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"
                                            }`}
                                        >
                                            {getMenuIcon(child.icon)}

                                            <span>{child.name}</span>
                                        </button>
                                    );
                                })}

                                {childMenus.length === 0 && parent.route && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleNavigation(parent.route)
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"
                                    >
                                        {getMenuIcon(parent.icon)}
                                        <span>{parent.name}</span>
                                    </button>
                                )}

                            </div>
                        </div>
                    );
                })}

                {/* Individually assigned menus without their parent */}
                {orphanMenus.length > 0 && (
                    <div>
                        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Additional Menus
                        </p>

                        <div className="space-y-1">
                            {orphanMenus.map((menu) => (
                                <button
                                    key={menu.id}
                                    type="button"
                                    onClick={() =>
                                        handleNavigation(menu.route)
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                                        location.pathname === menu.route
                                            ? "bg-emerald-700 text-white"
                                            : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"
                                    }`}
                                >
                                    {getMenuIcon(menu.icon)}
                                    <span>{menu.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeMenus.length === 0 && (
                    <p className="px-3 py-4 text-sm text-gray-400">
                        No menus assigned.
                    </p>
                )}

            </nav>

            <div className="border-t border-gray-200 p-4">
                <p className="text-center text-xs text-gray-400">
                    LoanFlow Management System
                </p>
            </div>

        </aside>
    );
}

export default Sidebar;
