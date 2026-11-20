
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanApplicationAssignmentRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<User?> GetActiveLoanOfficerByIdAsync(int userId);

    Task<LoanApplication?> GetApplicationForAssignmentAsync(int applicationId);

    Task<int> AssignAsync(
        LoanApplication application,
        LoanApplicationAssignment assignment);
}
