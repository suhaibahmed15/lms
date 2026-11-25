using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanRepository
{
    Task<(List<Loan> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null,
        int? officerId = null);

    Task<Loan?> GetByIdAsync(int loanId);

    Task<Loan?> GetByIdWithDetailsAsync(int loanId);

    Task<List<RepaymentSchedule>> GetRepaymentScheduleAsync(int loanId);

    Task<List<Repayment>> GetRepaymentHistoryAsync(int loanId);

    Task<User?> GetUserWithRoleAsync(int userId);
}
