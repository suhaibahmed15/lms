import { useEffect, useState } from "react";
import { Modal, Button, Select, Textarea, Form } from "../../components/common";

export default function AssignApplicationModal({
    isOpen,
    application,
    officers = [],
    onClose,
    onSubmit,
    loading,
    error
}) {
    const [assignedToUserId, setAssignedToUserId] = useState("");
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        if (isOpen && application) {
            setAssignedToUserId(application.assignedToUserId ? String(application.assignedToUserId) : "");
            setRemarks("");
        }
    }, [isOpen, application]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!assignedToUserId) return;

        await onSubmit({
            assignedToUserId: Number(assignedToUserId),
            remarks: remarks.trim() || null
        });
    };

    const officerOptions = officers.map((off) => ({
        value: off.id,
        label: `${off.fullName || off.userName} (${off.email})`
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Application"
            subtitle={`Assign Application #${application?.applicationNumber || ""} to a Loan Officer`}
            maxWidth="md"
        >
            <Form onSubmit={handleSubmit} error={error}>
                <Select
                    label="Select Loan Officer"
                    name="assignedToUserId"
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    options={officerOptions}
                    placeholder="Choose an officer"
                    required
                />

                <Textarea
                    label="Assignment Notes (Optional)"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    placeholder="Add instructions or notes for the officer..."
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        loadingText="Assigning..."
                    >
                        Confirm Assignment
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
