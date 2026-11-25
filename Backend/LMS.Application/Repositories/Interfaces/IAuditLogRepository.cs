using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IAuditLogRepository
{
    Task LogAsync(AuditLog log);

    Task<(List<AuditLog> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? action = null,
        string? entityName = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);
}
