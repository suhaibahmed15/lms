using LMS.Application.DTO.Repayments;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RepaymentSchedulesController : ControllerBase
{
    private readonly IRepaymentScheduleService _service;

    public RepaymentSchedulesController(
        IRepaymentScheduleService service)
    {
        _service = service;
    }

    [HttpPost("{loanId:int}/generate")]
    [Authorize(Policy = "Permission:LOAN_DISBURSE")]
    public async Task<IActionResult> Generate(
        int loanId,
        [FromBody] GenerateRepaymentScheduleDto dto)
    {
        var userIdValue =
            User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId) || userId <= 0)
        {
            return Unauthorized(new
            {
                message = "Invalid user token."
            });
        }

        try
        {
            var count = await _service.GenerateAsync(
                loanId,
                userId,
                dto);

            return Ok(new
            {
                message = "Repayment schedule generated successfully.",
                loanId,
                totalInstallments = count
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/RepaymentSchedules/loan/{loanId}
    [HttpGet("loan/{loanId:int}")]
    [Authorize(Policy = "Permission:REPAYMENT_SCHEDULE_VIEW")]
    public async Task<IActionResult> GetByLoanId(int loanId)
    {
        var userIdValue =
            User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId) || userId <= 0)
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        try
        {
            var items = await _service.GetByLoanIdAsync(userId, loanId);
            return Ok(new
            {
                message = "Repayment schedules retrieved successfully.",
                data = items
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }
}
