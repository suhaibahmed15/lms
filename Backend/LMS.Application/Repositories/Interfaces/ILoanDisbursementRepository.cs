
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanDisbursementRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<LoanApplication?> GetApprovedApplicationAsync(
        int applicationId);

    Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category);

    Task<bool> LoanExistsForApplicationAsync(
        int applicationId);

    Task<int> CreateLoanAsync(Loan loan);
}
