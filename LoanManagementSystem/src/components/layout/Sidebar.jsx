import { useEffect, useMemo, useState } from "react";
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
    CalendarCheck,
    LayoutList,
    KeyRound,
    Layers,
    List,
    History,
    Menu,
    ChevronDown,
    ChevronRight,
    X
} from "lucide-react";

const getMenuIcon = (iconName) => {
    const icons = {
        wallet: Wallet,
        "file-text": FileText,
        dashboard: LayoutDashboard,
        users: Users,
        settings: Settings,
        shield: ShieldCheck,
        "shield-check": ShieldCheck,
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
        "list-checks": ListChecks,
        list: List,
        "layout-list": LayoutList,
        "key-round": KeyRound,
        key: KeyRound,
        layers: Layers,
        history: History,
        "user-check": UserCheck,
        "check-circle": CheckCircle,
        landmark: Landmark,
        "clipboard-check": ClipboardCheck,
        "calendar-check": CalendarCheck,
        "wallet-cards": Wallet
    };

    const IconComponent = icons[iconName?.toLowerCase()] || Menu;

    return <IconComponent size={18} />;
};

function Sidebar({ menus = [], onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    const activeMenus = useMemo(
        () =>
            menus
                .filter((menu) => menu.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder),
        [menus]
    );

    const routableMenus = useMemo(
        () => activeMenus.filter((menu) => Boolean(menu.route && menu.route.trim())),
        [activeMenus]
    );

    const parentMenus = useMemo(() => {
        const roots = activeMenus
            .filter((menu) => menu.parentMenuId == null)
            .sort((a, b) => a.displayOrder - b.displayOrder);

        // Keep only parent menus that either have at least one active accessible child
        // OR are independently accessible with their own route.
        return roots.filter((parent) => {
            const hasChildren = routableMenus.some(
                (child) => child.parentMenuId === parent.id
            );
            const hasOwnRoute = Boolean(parent.route && parent.route.trim());
            return hasChildren || hasOwnRoute;
        });
    }, [activeMenus, routableMenus]);

    const getChildMenus = (parentId) => {
        return routableMenus
            .filter((menu) => menu.parentMenuId === parentId)
            .sort((a, b) => a.displayOrder - b.displayOrder);
    };

    // Orphan child menus whose parent is not included in activeMenus
    const orphanMenus = useMemo(() => {
        return routableMenus
            .filter(
                (menu) =>
                    menu.parentMenuId != null &&
                    !activeMenus.some((parent) => parent.id === menu.parentMenuId)
            )
            .sort((a, b) => a.displayOrder - b.displayOrder);
    }, [activeMenus, routableMenus]);

    const [expandedParents, setExpandedParents] = useState({});

    // Automatically expand the parent containing the currently active route
    useEffect(() => {
        const activeChild = routableMenus.find(
            (menu) => menu.parentMenuId != null && menu.route === location.pathname
        );

        if (activeChild?.parentMenuId != null) {
            setExpandedParents((prev) => ({
                ...prev,
                [activeChild.parentMenuId]: true
            }));
        }
    }, [location.pathname, routableMenus]);

    const toggleParent = (parentId) => {
        setExpandedParents((prev) => ({
            ...prev,
            [parentId]: !prev[parentId]
        }));
    };

    const handleNavigation = (route) => {
        if (!route) return;

        navigate(route);

        if (onClose) {
            onClose();
        }
    };

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-pink-500/20 bg-black text-zinc-100 shadow-2xl shadow-pink-950/20">
            {/* Brand Header */}
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="LMS Logo" className="h-10 w-auto max-w-[170px] object-contain drop-shadow" />
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[2px] text-zinc-500">
                    Navigation
                </p>

                {parentMenus.map((parent) => {
                    const childMenus = getChildMenus(parent.id);
                    const hasChildren = childMenus.length > 0;
                    const isExpanded = Boolean(expandedParents[parent.id]);
                    const hasActiveChild = childMenus.some(
                        (child) => location.pathname === child.route
                    );
                    const isParentDirectlyActive =
                        !hasChildren && Boolean(parent.route) && location.pathname === parent.route;

                    // Parent without children -> direct navigation button
                    if (!hasChildren && parent.route) {
                        return (
                            <button
                                key={parent.id}
                                type="button"
                                onClick={() => handleNavigation(parent.route)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${isParentDirectlyActive
                                    ? "bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/25"
                                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                            >
                                <span
                                    className={
                                        isParentDirectlyActive
                                            ? "text-white"
                                            : "text-pink-400/80"
                                    }
                                >
                                    {getMenuIcon(parent.icon)}
                                </span>

                                <span className="truncate">{parent.name}</span>
                            </button>
                        );
                    }

                    // Parent with children -> collapsible group
                    return (
                        <div key={parent.id} className="space-y-1">
                            <button
                                type="button"
                                onClick={() => toggleParent(parent.id)}
                                aria-expanded={isExpanded}
                                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${hasActiveChild
                                    ? "border border-pink-500/30 bg-pink-500/10 text-pink-300"
                                    : "text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    <span
                                        className={
                                            hasActiveChild
                                                ? "text-pink-400"
                                                : "text-zinc-400"
                                        }
                                    >
                                        {getMenuIcon(parent.icon)}
                                    </span>

                                    <span className="truncate">{parent.name}</span>
                                </span>

                                <span
                                    className={`shrink-0 transition-transform duration-200 ${hasActiveChild ? "text-pink-400" : "text-zinc-500"
                                        }`}
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="ml-3 space-y-1 border-l border-white/10 pl-3 pt-0.5">
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
                                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                                                    ? "bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20"
                                                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                                                    }`}
                                            >
                                                <span
                                                    className={
                                                        isActive
                                                            ? "text-white"
                                                            : "text-zinc-500"
                                                    }
                                                >
                                                    {getMenuIcon(child.icon)}
                                                </span>

                                                <span className="truncate">
                                                    {child.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Individually assigned menus without their parent */}
                {orphanMenus.length > 0 && (
                    <div className="pt-3">
                        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[2px] text-zinc-500">
                            Additional Menus
                        </p>

                        <div className="space-y-1">
                            {orphanMenus.map((menu) => {
                                const isActive = location.pathname === menu.route;

                                return (
                                    <button
                                        key={menu.id}
                                        type="button"
                                        onClick={() =>
                                            handleNavigation(menu.route)
                                        }
                                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${isActive
                                            ? "bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20"
                                            : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                                            }`}
                                    >
                                        <span
                                            className={
                                                isActive
                                                    ? "text-white"
                                                    : "text-pink-400/80"
                                            }
                                        >
                                            {getMenuIcon(menu.icon)}
                                        </span>
                                        <span className="truncate">
                                            {menu.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {parentMenus.length === 0 && orphanMenus.length === 0 && (
                    <p className="px-3 py-4 text-sm text-zinc-500">
                        No menus assigned.
                    </p>
                )}
            </nav>

            {/* Footer */}
            <div className="shrink-0 border-t border-white/10 p-4">
                <p className="text-center text-xs text-zinc-500">
                    © {new Date().getFullYear()} LMS Capital
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;
