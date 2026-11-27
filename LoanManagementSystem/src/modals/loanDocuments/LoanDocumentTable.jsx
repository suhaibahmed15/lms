
import {
    Download,
    CheckCircle,
    XCircle,
    FileText,
    RefreshCw
} from "lucide-react";

const getStatusStyle = (statusKey) => {
    switch (statusKey?.toUpperCase()) {
        case "DOCUMENT_VERIFIED":
            return "bg-green-500/10 text-green-400 border-green-500/20";

        case "DOCUMENT_REJECTED":
            return "bg-red-50 text-red-600 border-red-200";

        case "DOCUMENT_PENDING":
            return "bg-amber-50 text-amber-700 border-amber-200";

        default:
            return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
};

const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    return bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(bytes / 1024).toFixed(1)} KB`;
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
};

export default function LoanDocumentTable({
    documents = [],
    loading = false,
    error = "",
    success = "",
    selectedApplication,
    canVerify = false,
    onUpload,
    onDownload,
    onVerify,
    onReject,
    onRefresh
}) {
    return (
        <div className="overflow-hidden rounded-3xl border border-pink-200/80 bg-white shadow-xl shadow-pink-500/5">

            <div className="flex flex-col justify-between gap-4 border-b border-pink-100 p-5 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900">
                        Loan Documents
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        {selectedApplication
                            ? `Application: ${selectedApplication.applicationNumber || `#${selectedApplication.id}`}`
                            : "Select a loan application to view documents."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={!selectedApplication || loading}
                        className="flex items-center gap-2 rounded-xl border border-pink-100 px-4 py-2.5 text-sm text-zinc-700 hover:bg-pink-50/40 disabled:opacity-40"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    {onUpload && (
                        <button
                            type="button"
                            onClick={onUpload}
                            disabled={!selectedApplication}
                            className="rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-pink-500 disabled:opacity-40"
                        >
                            Upload Document
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="m-5 rounded-lg border border-red-200 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="m-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                    {success}
                </div>
            )}

            {!selectedApplication ? (
                <div className="px-5 py-16 text-center">
                    <FileText size={36} className="mx-auto mb-3 text-zinc-600" />
                    <p className="text-sm text-zinc-500">
                        Select an application to view its documents.
                    </p>
                </div>
            ) : loading ? (
                <div className="px-5 py-16 text-center text-sm text-zinc-500">
                    Loading documents...
                </div>
            ) : documents.length === 0 ? (
                <div className="px-5 py-16 text-center">
                    <FileText size={36} className="mx-auto mb-3 text-zinc-600" />
                    <p className="text-sm text-zinc-500">
                        No documents uploaded for this application yet.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-pink-50/40">
                            <tr className="text-xs uppercase tracking-wider text-zinc-500">
                                <th className="px-5 py-4">Document</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4">Size</th>
                                <th className="px-5 py-4">Uploaded</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Remarks</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50">
                            {documents.map((document) => {
                                const isPending =
                                    document.statusKey?.toUpperCase() === "DOCUMENT_PENDING";

                                const remarks =
                                    document.rejectionRemarks ||
                                    document.verificationRemarks ||
                                    "-";

                                return (
                                    <tr
                                        key={document.id}
                                        className="text-sm transition hover:bg-pink-50/30"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex max-w-[220px] items-center gap-3">
                                                <FileText
                                                    size={20}
                                                    className="shrink-0 text-pink-400"
                                                />

                                                <span className="truncate font-medium text-zinc-900">
                                                    {document.fileName}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-zinc-700">
                                            {document.documentType}
                                        </td>

                                        <td className="px-5 py-4 text-zinc-500">
                                            {formatFileSize(document.fileSizeBytes)}
                                        </td>

                                        <td className="px-5 py-4 text-zinc-500">
                                            {formatDate(document.createdAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(document.statusKey)}`}>
                                                {document.statusName || "Unknown"}
                                            </span>
                                        </td>

                                        <td className="max-w-[180px] px-5 py-4">
                                            <span
                                                title={remarks}
                                                className="block truncate text-xs text-zinc-500"
                                            >
                                                {remarks}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() => onDownload(document)}
                                                    title="Download document"
                                                    className="rounded-lg border border-pink-100 p-2 text-zinc-700 hover:border-pink-500/40 hover:text-pink-400"
                                                >
                                                    <Download size={16} />
                                                </button>

                                                {canVerify && isPending && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => onVerify(document)}
                                                            title="Verify document"
                                                            className="rounded-lg border border-green-500/20 p-2 text-green-400 hover:bg-green-500/10"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => onReject(document)}
                                                            title="Reject document"
                                                            className="rounded-lg border border-red-200 p-2 text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <XCircle size={16} />
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
            )}
        </div>
    );
}
