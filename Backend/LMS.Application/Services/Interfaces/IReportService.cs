using LMS.Application.DTO.Reports;

namespace LMS.Application.Services.Interfaces;

public interface IReportService
{
    Task<List<LoanReportItemDto>> GetLoansReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null);

    Task<byte[]> ExportLoansReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null);

    Task<CustomerStatementDto> GetCustomerStatementAsync(int userId, int loanId);

    Task<byte[]> ExportCustomerStatementCsvAsync(int userId, int loanId);

    Task<List<RepaymentReportItemDto>> GetRepaymentsReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null);

    Task<byte[]> ExportRepaymentsReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null);

    Task<List<LoanReportItemDto>> GetOutstandingLoansReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<byte[]> ExportOutstandingLoansReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<List<InstallmentReportItemDto>> GetInstallmentsReportAsync(
        int userId,
        bool overdueOnly,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<byte[]> ExportInstallmentsReportCsvAsync(
        int userId,
        bool overdueOnly,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<List<DisbursementReportItemDto>> GetDisbursementsReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<byte[]> ExportDisbursementsReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);
}
