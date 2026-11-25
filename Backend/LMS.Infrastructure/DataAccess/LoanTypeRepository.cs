using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanTypeRepository : ILoanTypeRepository
{
    private readonly ApplicationDbContext _context;

    public LoanTypeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LoanType>> GetAllAsync()
    {
        return await _context.LoanTypes
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<List<LoanType>> GetActiveAsync()
    {
        return await _context.LoanTypes
            .AsNoTracking()
            .Where(x => !x.IsDeleted && x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync();
    }

    public async Task<(List<LoanType> Items, int TotalRecords, int ActiveCount, int InactiveCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive)
    {
        var baseQuery = _context.LoanTypes
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        var activeCount = await baseQuery.CountAsync(x => x.IsActive);
        var inactiveCount = await baseQuery.CountAsync(x => !x.IsActive);

        var query = baseQuery;

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(term) ||
                x.Code.ToLower().Contains(term) ||
                (x.Description != null && x.Description.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.ToLowerInvariant() switch
        {
            "code" => isDesc ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
            "minamount" => isDesc ? query.OrderByDescending(x => x.MinAmount) : query.OrderBy(x => x.MinAmount),
            "maxamount" => isDesc ? query.OrderByDescending(x => x.MaxAmount) : query.OrderBy(x => x.MaxAmount),
            "interestrate" => isDesc ? query.OrderByDescending(x => x.InterestRate) : query.OrderBy(x => x.InterestRate),
            "mintermmonths" => isDesc ? query.OrderByDescending(x => x.MinTermMonths) : query.OrderBy(x => x.MinTermMonths),
            "maxtermmonths" => isDesc ? query.OrderByDescending(x => x.MaxTermMonths) : query.OrderBy(x => x.MaxTermMonths),
            "isactive" => isDesc ? query.OrderByDescending(x => x.IsActive) : query.OrderBy(x => x.IsActive),
            "createdat" => isDesc ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            _ => isDesc ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords, activeCount, inactiveCount);
    }

    public async Task<LoanType?> GetByIdAsync(int id)
    {
        return await _context.LoanTypes
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
    }

    public async Task<LoanType?> GetByCodeAsync(string code)
    {
        return await _context.LoanTypes
            .FirstOrDefaultAsync(x => x.Code.ToLower() == code.Trim().ToLower() && !x.IsDeleted);
    }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null)
    {
        var trimmed = name.Trim().ToLower();
        return await _context.LoanTypes
            .AnyAsync(x => !x.IsDeleted &&
                           x.Name.ToLower() == trimmed &&
                           (!excludeId.HasValue || x.Id != excludeId.Value));
    }

    public async Task<bool> ExistsByCodeAsync(string code, int? excludeId = null)
    {
        var trimmed = code.Trim().ToLower();
        return await _context.LoanTypes
            .AnyAsync(x => !x.IsDeleted &&
                           x.Code.ToLower() == trimmed &&
                           (!excludeId.HasValue || x.Id != excludeId.Value));
    }

    public async Task<bool> HasApplicationsAsync(int loanTypeId)
    {
        return await _context.LoanApplications
            .AnyAsync(a => a.LoanTypeId == loanTypeId && !a.IsDeleted);
    }

    public async Task AddAsync(LoanType loanType)
    {
        await _context.LoanTypes.AddAsync(loanType);
    }

    public Task UpdateAsync(LoanType loanType)
    {
        _context.LoanTypes.Update(loanType);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
