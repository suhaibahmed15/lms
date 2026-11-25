using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IRepaymentScheduleRepository
{
    Task<Loan?> GetLoanByIdAsync(int loanId);

    Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category);

    Task<bool> ScheduleExistsAsync(int loanId);

    Task<List<RepaymentSchedule>> GetByLoanIdAsync(int loanId);

    Task<User?> GetUserWithRoleAsync(int userId);

    Task<int> CreateSchedulesAsync(
        List<RepaymentSchedule> schedules);
}
