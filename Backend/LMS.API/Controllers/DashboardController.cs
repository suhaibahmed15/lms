
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // GET: api/Dashboard/summary
    [HttpGet("summary")]
    [Authorize(Policy = "Permission:DASHBOARD_VIEW")]
    public async Task<IActionResult> GetSummary()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user token."
            });
        }

        var result = await _dashboardService.GetSummaryAsync(userId);

        return Ok(result);
    }
}
