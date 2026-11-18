using LMS.Application.Repositories.Interfaces;

using LMS.Domain.Entities;

using LMS.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class StatusRepository : IStatusRepository
{

    private readonly ApplicationDbContext _context;

    public StatusRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Status>> GetAllAsync()
    {
        return await _context.Statuses
            .AsNoTracking()
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .ToListAsync();
    }

    public async Task<(List<Status> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        string? category,
        bool? isActive)
    {
        var query = _context.Statuses
            .AsNoTracking()
            .Where(s => !s.IsDeleted);

        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = category.Trim().ToLower();
            query = query.Where(s => s.Category.ToLower() == cat);
        }

        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(term) ||
                s.Key.ToLower().Contains(term) ||
                s.Category.ToLower().Contains(term) ||
                (s.Description != null && s.Description.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "name" => isDesc ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "key" => isDesc ? query.OrderByDescending(s => s.Key) : query.OrderBy(s => s.Key),
            "category" => isDesc ? query.OrderByDescending(s => s.Category) : query.OrderBy(s => s.Category),
            "isactive" or "status" => isDesc ? query.OrderByDescending(s => s.IsActive) : query.OrderBy(s => s.IsActive),
            "id" => isDesc ? query.OrderByDescending(s => s.Id) : query.OrderBy(s => s.Id),
            _ => isDesc ? query.OrderByDescending(s => s.SortOrder).ThenByDescending(s => s.Id) : query.OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<Status?> GetByIdAsync(int id)
    {
        return await _context.Statuses
          .FirstOrDefaultAsync(s =>
          s.Id == id && !s.IsDeleted);
    }


    public async Task<bool> ExistsByKeyAsync(
        string key,
        int? excludeStatusId = null)
    {
        return await _context.Statuses.AnyAsync(s =>
            !s.IsDeleted &&
            s.Key == key &&
            (excludeStatusId == null ||
             s.Id != excludeStatusId.Value));
    }

    public async Task AddAsync(Status status)
    {
        await _context.Statuses.AddAsync(status);
    }

    public Task UpdateAsync(Status status)
    {


        _context.Statuses.Update(status);

        return Task.CompletedTask;
    }


    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

}