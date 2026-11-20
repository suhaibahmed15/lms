
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanApplicationRepository
{
    Task<User?> GetUserByIdAsync(int userId);

    Task<LoanType?> GetActiveLoanTypeByIdAsync(int loanTypeId);

    Task<Status?> GetStatusByKeyAsync(string statusKey);

    Task<List<LoanApplication>> GetAllAsync();

    Task<(List<LoanApplication> Items, int TotalRecords)> GetPagedForUserAsync(
        int userId,
        string roleKey,
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? statusId,
        int? loanTypeId);

    Task AddAsync(LoanApplication application);

    Task<LoanApplication?> GetApplicationByIdAsync(int applicationId);

    Task SaveChangesAsync();
}
