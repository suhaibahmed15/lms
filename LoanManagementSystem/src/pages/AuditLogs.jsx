import { useCallback, useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    Calendar
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/common";
import { getAuditLogs } from "../services/auditLogService";
import { getCurrentUser } from "../utils/auth";

const getActionBadge = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("APPROVE") || act.includes("DISBURSE") || act.includes("VERIFY")) {
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    if (act.includes("REJECT") || act.includes("DELETE") || act.includes("REVOKE")) {
        return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
    if (act.includes("UPDATE") || act.includes("ASSIGN") || act.includes("REVIEW")) {
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
};

export default function AuditLogs() {
    const user = getCurrentUser();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                pageNumber,
                pageSize,
                search: search.trim() || undefined,
                action: actionFilter || undefined,
                entityName: entityFilter || undefined
            };

            const response = await getAuditLogs(params);
            const records = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

            setLogs(records);
            setTotalRecords(response?.totalRecords ?? records.length);
            setTotalPages(response?.totalPages ?? 0);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load audit logs. Admin permission required.");
            setLogs([]);
            setTotalRecords(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, actionFilter, entityFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="text-orange-500" size={24} />
                            System Audit Logs
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Immutable administrative audit trail tracking entity state changes and user operations.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        onClick={fetchLogs}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
                    <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col sm:flex-row gap-3">
                            <div className="relative w-full sm:max-w-sm">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
                                    placeholder="Search logs by keyword..."
                                    className="w-full rounded-xl border border-white/10 bg-[#181818] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/70"
                                />
                            </div>

                            <select
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPageNumber(1); }}
                                className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="APPROVE">Approve</option>
                                <option value="REJECT">Reject</option>
                                <option value="DISBURSE">Disburse</option>
                                <option value="VERIFY">Verify</option>
                                <option value="ASSIGN">Assign</option>
                            </select>

                            <select
                                value={entityFilter}
                                onChange={(e) => { setEntityFilter(e.target.value); setPageNumber(1); }}
                                className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none"
                            >
                                <option value="">All Entities</option>
                                <option value="LoanApplication">LoanApplication</option>
                                <option value="Loan">Loan</option>
                                <option value="Repayment">Repayment</option>
                                <option value="LoanDocument">LoanDocument</option>
                                <option value="LoanGuarantor">LoanGuarantor</option>
                                <option value="User">User</option>
                                <option value="Role">Role</option>
                                <option value="Permission">Permission</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
                                className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none"
                            >
                                <option value={10}>10 per page</option>
                                <option value={15}>15 per page</option>
                                <option value={30}>30 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    <th className="px-5 py-4">Timestamp</th>
                                    <th className="px-5 py-4">Actor</th>
                                    <th className="px-5 py-4">Action</th>
                                    <th className="px-5 py-4">Entity</th>
                                    <th className="px-5 py-4">Record ID</th>
                                    <th className="px-5 py-4">Details</th>
                                    <th className="px-5 py-4">IP Address</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/5 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-zinc-500">
                                            Loading audit records...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-zinc-500">
                                            No audit log records found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="transition hover:bg-white/[0.025]"
                                        >
                                            <td className="px-5 py-4 text-xs text-zinc-400 font-mono whitespace-nowrap">
                                                {log.timestamp || log.createdAt
                                                    ? new Date(log.timestamp || log.createdAt).toLocaleString()
                                                    : "—"}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-white">
                                                {log.userName || log.userEmail || `User #${log.userId || "System"}`}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-300 font-mono">
                                                {log.entityName}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-400 font-mono">
                                                {log.entityId ? `#${log.entityId}` : "—"}
                                            </td>

                                            <td className="px-5 py-4 text-xs text-zinc-300 max-w-xs truncate" title={log.details || log.description}>
                                                {log.details || log.description || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-xs text-zinc-500 font-mono">
                                                {log.ipAddress || "127.0.0.1"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-zinc-500">
                            Total records:{" "}
                            <span className="font-semibold text-white">
                                {totalRecords}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={ChevronLeft}
                                disabled={pageNumber <= 1 || loading}
                                onClick={() => setPageNumber(pageNumber - 1)}
                            >
                                Prev
                            </Button>

                            <span className="px-2 text-sm text-zinc-400">
                                Page {pageNumber} of {totalPages || 1}
                            </span>

                            <Button
                                variant="secondary"
                                size="sm"
                                iconRight={ChevronRight}
                                disabled={pageNumber >= totalPages || loading}
                                onClick={() => setPageNumber(pageNumber + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
