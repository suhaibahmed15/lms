using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanTypeRepository
{
    Task<List<LoanType>> GetAllAsync();

    Task<List<LoanType>> GetActiveAsync();

    Task<(List<LoanType> Items, int TotalRecords, int ActiveCount, int InactiveCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive);

    Task<LoanType?> GetByIdAsync(int id);

    Task<LoanType?> GetByCodeAsync(string code);

    Task<bool> ExistsByNameAsync(string name, int? excludeId = null);

    Task<bool> ExistsByCodeAsync(string code, int? excludeId = null);

    Task<bool> HasApplicationsAsync(int loanTypeId);

    Task AddAsync(LoanType loanType);

    Task UpdateAsync(LoanType loanType);

    Task SaveChangesAsync();
}
