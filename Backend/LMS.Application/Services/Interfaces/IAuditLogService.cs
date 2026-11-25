using LMS.Application.DTO.AuditLogs;

namespace LMS.Application.Services.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        int? userId,
        string action,
        string entityName,
        int? entityId = null,
        string? details = null);

    Task<object> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? action = null,
        string? entityName = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);
}
