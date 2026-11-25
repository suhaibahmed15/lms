using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IRepaymentRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<User?> GetUserWithRoleAsync(int userId);

    Task<RepaymentSchedule?> GetScheduleForCustomerAsync(
        int scheduleId,
        int customerId);

    Task<RepaymentSchedule?> GetScheduleByIdAsync(int scheduleId);

    Task<bool> PaymentReferenceExistsAsync(string reference);

    Task<bool> HasPendingPaymentAsync(int scheduleId);

    Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category);

    Task<Status?> GetLoanStatusByKeyAsync(string statusKey);

    Task<int> CreateAsync(Repayment repayment);

    Task<List<Repayment>> GetPendingPaymentsAsync();

    Task<(List<Repayment> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null,
        int? loanId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);

    Task<Repayment?> GetPaymentByIdAsync(int repaymentId);

    Task SaveChangesAsync();

    // Database transaction methods
    Task BeginTransactionAsync();

    Task CommitTransactionAsync();

    Task RollbackTransactionAsync();
}
