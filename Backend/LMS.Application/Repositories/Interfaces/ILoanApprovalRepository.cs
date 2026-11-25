using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanApprovalRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<LoanApplication?> GetApplicationForDecisionAsync(
        int applicationId);

    Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category);

    Task<bool> HasExistingLoanAsync(int applicationId);

    Task<int> SaveDecisionAsync(
        LoanApplication application,
        LoanApproval approval,
        Loan? loan = null);
}
