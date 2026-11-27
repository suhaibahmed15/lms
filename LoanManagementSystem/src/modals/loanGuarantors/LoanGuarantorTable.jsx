function LoanGuarantorTable({
    guarantors,
    loading,
    canManage,
    canReview,
    onEdit,
    onDelete,
    onVerify,
    onReject,
}) {
    const getStatusStyle = (statusKey) => {
        switch (statusKey) {
            case "GUARANTOR_VERIFIED":
                return "bg-green-500/10 text-green-400 border-green-500/20";

            case "GUARANTOR_REJECTED":
                return "bg-red-50 text-red-600 border-red-200";

            default:
                return "bg-amber-50 text-amber-700 border-amber-200";
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center text-zinc-500">
                Loading guarantors...
            </div>
        );
    }

    if (!guarantors.length) {
        return (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center">
                <p className="font-medium text-zinc-900">No guarantors found</p>
                <p className="mt-1 text-sm text-zinc-500">
                    No guarantors have been added to this application yet.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900">
                        <tr className="text-xs uppercase tracking-wider text-zinc-500">
                            <th className="px-5 py-4">Guarantor</th>
                            <th className="px-5 py-4">Contact</th>
                            <th className="px-5 py-4">National ID</th>
                            <th className="px-5 py-4">Relationship</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4">Added On</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                        {guarantors.map((guarantor) => {
                            const isPending =
                                guarantor.statusKey === "GUARANTOR_PENDING";

                            return (
                                <tr
                                    key={guarantor.id}
                                    className="text-zinc-700 transition hover:bg-slate-900/70"
                                >
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-zinc-900">
                                            {guarantor.fullName}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {guarantor.email || "No email"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        {guarantor.phoneNumber}
                                    </td>

                                    <td className="px-5 py-4">
                                        {guarantor.nationalIdNumber || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        {guarantor.relationshipToApplicant || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                                guarantor.statusKey
                                            )}`}
                                        >
                                            {guarantor.statusName}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-xs text-zinc-500">
                                        {guarantor.createdAt
                                            ? new Date(
                                                guarantor.createdAt
                                            ).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            {canManage && (
                                                <>
                                                    <button
                                                        onClick={() => onEdit(guarantor)}
                                                        className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-zinc-700 hover:border-pink-500 hover:text-pink-400"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => onDelete(guarantor)}
                                                        className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                            {canReview && isPending && (
                                                <>
                                                    <button
                                                        onClick={() => onVerify(guarantor)}
                                                        className="rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20"
                                                    >
                                                        Verify
                                                    </button>

                                                    <button
                                                        onClick={() => onReject(guarantor)}
                                                        className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LoanGuarantorTable;