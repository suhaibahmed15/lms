
import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import LoanTypeModal from "../modals/loanTypes/LoanTypeModal";
import LoanTypeTable from "../modals/loanTypes/LoanTypeTable";

import {
  getAllLoanTypes,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  changeLoanTypeStatus,
} from "../services/loanTypeService";

import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, getUserId } from "../utils/auth";

function LoanTypes() {
  const user = getCurrentUser();

  // Loan type data
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search, filter and pagination
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Permissions
  const [canManage, setCanManage] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Get current user's permissions
  const loadPermissions = useCallback(async () => {
    try {
      const userId = getUserId();

      if (!userId) return;

      const [roleResponse, permissionsResponse] = await Promise.all([
        getMyRole(),
        getEffectivePermissionsByUser(userId),
      ]);

      const role = roleResponse?.data || roleResponse;
      const isAdmin = role?.key?.toUpperCase() === "ADMIN";

      const permissions = Array.isArray(permissionsResponse)
        ? permissionsResponse
        : permissionsResponse?.data || [];

      const permissionKeys = permissions.map((permission) =>
        permission.key?.toUpperCase()
      );

      setCanManage(
        isAdmin || permissionKeys.includes("LOAN_TYPE_MANAGE")
      );
    } catch (err) {
      console.error("Permission loading error:", err);
      setCanManage(false);
    }
  }, []);

  // Fetch loan types
  const fetchLoanTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        pageNumber,
        pageSize,
        search: search.trim() || undefined,
        sortBy,
        sortDirection,
        isActive:
          isActiveFilter === ""
            ? undefined
            : isActiveFilter === "true",
      };

      const response = await getAllLoanTypes(params);

      // Support different paginated response structures
      let records = [];

      if (Array.isArray(response)) {
        records = response;
      } else if (Array.isArray(response?.data)) {
        records = response.data;
      } else if (Array.isArray(response?.items)) {
        records = response.items;
      } else if (Array.isArray(response?.data?.items)) {
        records = response.data.items;
      }

      const pagination = response?.pagination || response?.data?.pagination;

      setLoanTypes(records);

      const total = Number(
        response?.totalRecords ??
        response?.data?.totalRecords ??
        pagination?.totalRecords ??
        records.length
      );

      setTotalRecords(total);

      setTotalPages(
        Number(
          response?.totalPages ??
          response?.data?.totalPages ??
          pagination?.totalPages ??
          Math.ceil(total / pageSize)
        )
      );
    } catch (err) {
      console.error("Loan types loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load loan types."
      );

      setLoanTypes([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [
    pageNumber,
    pageSize,
    search,
    sortBy,
    sortDirection,
    isActiveFilter,
  ]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    fetchLoanTypes();
  }, [fetchLoanTypes]);

  // Search
  const handleSearch = (value) => {
    setSearch(value);
    setPageNumber(1);
  };

  // Active filter
  const handleActiveFilter = (value) => {
    setIsActiveFilter(value);
    setPageNumber(1);
  };

  // Sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }

    setPageNumber(1);
  };

  // Open create modal
  const handleAdd = () => {
    setSelectedLoanType(null);
    setModalError("");
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (loanType) => {
    setSelectedLoanType(loanType);
    setModalError("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    if (modalLoading) return;

    setIsModalOpen(false);
    setSelectedLoanType(null);
    setModalError("");
  };

  // Create or update loan type
  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      setModalError("");
      setSuccess("");

      if (selectedLoanType) {
        await updateLoanType(selectedLoanType.id, formData);
        setSuccess("Loan type updated successfully.");
      } else {
        await createLoanType(formData);
        setSuccess("Loan type created successfully.");
      }

      setIsModalOpen(false);
      setSelectedLoanType(null);

      await fetchLoanTypes();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Unable to save loan type.";

      setModalError(message);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  // Delete loan type
  const handleDelete = async (loanType) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${loanType.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteLoanType(loanType.id);

      setSuccess("Loan type deleted successfully.");

      await fetchLoanTypes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete loan type."
      );
    }
  };

  // Activate or deactivate loan type
  const handleToggleStatus = async (loanType) => {
    const action = loanType.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${loanType.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await changeLoanTypeStatus(
        loanType.id,
        !loanType.isActive
      );

      setSuccess(
        `Loan type ${loanType.isActive ? "deactivated" : "activated"} successfully.`
      );

      await fetchLoanTypes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to change loan type status."
      );
    }
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6">

        <LoanTypeTable
          loanTypes={loanTypes}
          loading={loading}
          error={error}
          success={success}
          search={search}
          onSearchChange={handleSearch}
          isActiveFilter={isActiveFilter}
          onActiveFilterChange={handleActiveFilter}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(Number(value));
            setPageNumber(1);
          }}
          onRefresh={fetchLoanTypes}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          canManage={canManage}
        />

        <LoanTypeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          loanType={selectedLoanType}
          onSubmit={handleSubmit}
          loading={modalLoading}
          error={modalError}
        />

      </div>
    </MainLayout>
  );
}

export default LoanTypes;
