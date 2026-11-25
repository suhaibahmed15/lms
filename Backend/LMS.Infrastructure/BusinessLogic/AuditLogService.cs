using LMS.Application.DTO.AuditLogs;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace LMS.Infrastructure.BusinessLogic;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(
        IAuditLogRepository repository,
        IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(
        int? userId,
        string action,
        string entityName,
        int? entityId = null,
        string? details = null)
    {
        try
        {
            var resolvedUserId = userId ?? GetCurrentUserId();
            var ip = GetClientIpAddress();

            var cleanDetails = MaskSensitiveInfo(details);
            if (cleanDetails != null && cleanDetails.Length > 2000)
            {
                cleanDetails = cleanDetails[..1997] + "...";
            }

            var log = new AuditLog
            {
                UserId = resolvedUserId,
                Action = action.Length > 100 ? action[..100] : action,
                EntityName = entityName.Length > 100 ? entityName[..100] : entityName,
                EntityId = entityId,
                Details = cleanDetails,
                IpAddress = ip != null && ip.Length > 45 ? ip[..45] : ip,
                OccurredAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _repository.LogAsync(log);
        }
        catch
        {
            // Logging failure must never break business transactions
        }
    }

    public async Task<object> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? action = null,
        string? entityName = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : Math.Min(pageSize, 100);

        var (items, total) = await _repository.GetPagedAsync(
            pageNumber, pageSize, search, action, entityName, fromDate, toDate);

        var dtos = items.Select(a => new AuditLogResponseDto
        {
            Id = a.Id,
            UserId = a.UserId,
            UserName = a.User?.FullName,
            UserEmail = a.User?.Email,
            Action = a.Action,
            EntityName = a.EntityName,
            EntityId = a.EntityId,
            Details = a.Details,
            IpAddress = a.IpAddress,
            OccurredAt = a.OccurredAt
        }).ToList();

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);

        return new
        {
            message = "Audit logs retrieved successfully.",
            data = dtos,
            totalRecords = total,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    private int? GetCurrentUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userIdValue = user?.FindFirst("UserId")?.Value
            ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return int.TryParse(userIdValue, out var id) && id > 0 ? id : null;
    }

    private string? GetClientIpAddress()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return null;

        var forwarded = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
        {
            return forwarded.Split(',')[0].Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString();
    }

    private static string? MaskSensitiveInfo(string? details)
    {
        if (string.IsNullOrWhiteSpace(details)) return details;

        return Regex.Replace(
            details,
            @"(?i)(password|token|secret|hash)\s*[:=]\s*""?[^"",\s\}]+""?",
            "$1: [PROTECTED]");
    }
}
