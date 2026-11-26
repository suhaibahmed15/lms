using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Permission:AUDIT_LOG_VIEW")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? action = null,
        [FromQuery] string? entityName = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _auditLogService.GetPagedAsync(
            pageNumber, pageSize, search, action, entityName, fromDate, toDate);

        return Ok(result);
    }
}
