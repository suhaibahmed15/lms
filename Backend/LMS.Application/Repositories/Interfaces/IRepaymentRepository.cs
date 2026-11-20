using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IRepaymentRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<RepaymentSchedule?> GetScheduleForCustomerAsync(
        int scheduleId,
        int customerId);

    Task<bool> PaymentReferenceExistsAsync(string reference);

    Task<bool> HasPendingPaymentAsync(int scheduleId);

    Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category);

    Task<Status?> GetLoanStatusByKeyAsync(string statusKey);

    Task<int> CreateAsync(Repayment repayment);

    Task<List<Repayment>> GetPendingPaymentsAsync();

    Task<Repayment?> GetPaymentByIdAsync(int repaymentId);

    Task SaveChangesAsync();

    // Database transaction methods
    Task BeginTransactionAsync();

    Task CommitTransactionAsync();

    Task RollbackTransactionAsync();
}