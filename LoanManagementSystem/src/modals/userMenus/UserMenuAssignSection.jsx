import { Plus, Search } from "lucide-react";
import { Button } from "../../components/common";

export default function UserMenuAssignSection({
    availableMenus = [],
    selectedMenuIds = [],
    onToggleMenu,
    search,
    onSearchChange,
    onAssign,
    assigning
}) {
    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-pink-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-pink-500/10";

    return (
        <div className="rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
            <div className="border-b border-white/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Plus size={20} className="text-pink-400" />
                            <h2 className="font-semibold text-white">
                                Assign Additional Menus
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            Select menus that are not already available through the user's role or individual assignments.
                        </p>
                    </div>

                    <span className="text-sm font-semibold text-pink-400">
                        {selectedMenuIds.length} selected
                    </span>
                </div>

                <div className="relative mt-4">
                    <Search
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search available menus..."
                        className={`${controlClass} w-full pl-10`}
                    />
                </div>
            </div>

            <div className="p-5">
                {availableMenus.length === 0 ? (
                    <p className="py-6 text-center text-sm text-zinc-500">
                        No additional menus available.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availableMenus.map((menu) => {
                            const isChecked = selectedMenuIds.includes(Number(menu.id));
                            return (
                                <label
                                    key={menu.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                                        isChecked
                                            ? "border-pink-500/50 bg-pink-500/15"
                                            : "border-white/10 bg-white/[0.03] hover:border-pink-500/30 hover:bg-white/[0.06]"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => onToggleMenu(menu.id)}
                                        className="h-4 w-4 cursor-pointer accent-pink-500"
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-white">
                                            {menu.name}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-zinc-400">
                                            {menu.key}
                                        </p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={onAssign}
                        disabled={assigning || selectedMenuIds.length === 0}
                        loading={assigning}
                        loadingText="Assigning..."
                        icon={Plus}
                    >
                        Assign Selected Menus
                    </Button>
                </div>
            </div>
        </div>
    );
}
