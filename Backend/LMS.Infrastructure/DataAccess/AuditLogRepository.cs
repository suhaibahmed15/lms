using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;

    public AuditLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(AuditLog log)
    {
        await _context.AuditLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }

    public async Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? action = null,
        string? entityName = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => !a.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(a =>
                a.Action.Contains(s) ||
                a.EntityName.Contains(s) ||
                (a.Details != null && a.Details.Contains(s)) ||
                (a.User != null && a.User.FullName.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(a => a.Action == action.Trim());
        }

        if (!string.IsNullOrWhiteSpace(entityName))
        {
            query = query.Where(a => a.EntityName == entityName.Trim());
        }

        if (fromDate.HasValue)
        {
            query = query.Where(a => a.OccurredAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(a => a.OccurredAt <= toDate.Value);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.OccurredAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }
}
