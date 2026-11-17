
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanApplicationRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<LoanType?> GetActiveLoanTypeByIdAsync(int loanTypeId);

    Task<Status?> GetStatusByKeyAsync(string statusKey);

    Task<List<LoanApplication>> GetAllAsync();
    Task AddAsync(LoanApplication application);

    Task SaveChangesAsync();
}
