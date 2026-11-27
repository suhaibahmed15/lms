import {
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { Button } from "../../components/common";

export default function StatusTable({
    statuses = [],
    loading,
    error,
    success,
    categoryFilter,
    onCategoryFilterChange,
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
    onToggleActive,
    canManage
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">System Workflow Statuses</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage master status categories for applications, loans, documents, and repayments.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {canManage && (
                        <Button onClick={onAdd} icon={Plus}>
                            New Status
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        onClick={onRefresh}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {success}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
                <div className="flex flex-col gap-3 border-b border-pink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:max-w-xs">
                        <select
                            value={categoryFilter}
                            onChange={(e) => onCategoryFilterChange(e.target.value)}
                            className="w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                        >
                            <option value="">All Categories</option>
                            <option value="Application">Application</option>
                            <option value="Loan">Loan</option>
                            <option value="Document">Document</option>
                            <option value="Guarantor">Guarantor</option>
                            <option value="Repayment">Repayment</option>
                            <option value="RepaymentSchedule">Repayment Schedule</option>
                        </select>
                    </div>

                    <span className="text-xs text-zinc-500">
                        Total {statuses.length} workflow statuses
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-pink-100 bg-pink-50/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                <th className="px-5 py-4">Sort</th>
                                <th className="px-5 py-4">Category</th>
                                <th className="px-5 py-4">Status Name</th>
                                <th className="px-5 py-4">Key</th>
                                <th className="px-5 py-4">Active</th>
                                {canManage && <th className="px-5 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                                        Loading master statuses...
                                    </td>
                                </tr>
                            ) : statuses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                                        No statuses found.
                                    </td>
                                </tr>
                            ) : (
                                statuses.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-pink-50/30">
                                        <td className="px-5 py-4 text-xs font-mono text-zinc-500">
                                            #{item.sortOrder || 1}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-pink-400">
                                            {item.category}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-zinc-900">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                                            {item.key}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                                            }`}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        {canManage && (
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        icon={item.isActive ? ToggleRight : ToggleLeft}
                                                        onClick={() => onToggleActive(item)}
                                                        title={item.isActive ? "Deactivate" : "Activate"}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        icon={Edit3}
                                                        onClick={() => onEdit(item)}
                                                        title="Edit Status"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        icon={Trash2}
                                                        onClick={() => onDelete(item)}
                                                        title="Delete Status"
                                                    />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
