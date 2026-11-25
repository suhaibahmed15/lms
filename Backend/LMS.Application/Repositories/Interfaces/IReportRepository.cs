using LMS.Application.DTO.Reports;
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IReportRepository
{
    Task<List<Loan>> GetLoansReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null);

    Task<Loan?> GetLoanForStatementAsync(int loanId);

    Task<List<Repayment>> GetRepaymentsReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null);

    Task<List<RepaymentSchedule>> GetInstallmentsReportAsync(
        bool overdueOnly,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<List<Loan>> GetDisbursementsReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null);

    Task<User?> GetUserWithRoleAsync(int userId);
}
