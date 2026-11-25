using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoansController : ControllerBase
{
    private readonly ILoanService _loanService;

    public LoansController(ILoanService loanService)
    {
        _loanService = loanService;
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdValue = User.FindFirst("UserId")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return int.TryParse(userIdValue, out userId) && userId > 0;
    }

    // GET: api/Loans
    [HttpGet]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? statusKey = null,
        [FromQuery] int? customerId = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _loanService.GetPagedAsync(
                userId, pageNumber, pageSize, search, statusKey, customerId);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    // GET: api/Loans/my-loans
    [HttpGet("my-loans")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetMyLoans(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? statusKey = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _loanService.GetMyLoansAsync(
                userId, pageNumber, pageSize, statusKey);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    // GET: api/Loans/{id}
    [HttpGet("{id:int}")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetById(int id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _loanService.GetByIdAsync(userId, id);
            return Ok(new
            {
                message = "Loan details retrieved successfully.",
                data = result
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

    // GET: api/Loans/{id}/repayment-schedule
    [HttpGet("{id:int}/repayment-schedule")]
    [HttpGet("{id:int}/schedule")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetRepaymentSchedule(int id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _loanService.GetRepaymentScheduleAsync(userId, id);
            return Ok(new
            {
                message = "Loan repayment schedule retrieved successfully.",
                data = result
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

    // GET: api/Loans/{id}/repayments
    [HttpGet("{id:int}/repayments")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetRepayments(int id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _loanService.GetRepaymentHistoryAsync(userId, id);
            return Ok(new
            {
                message = "Loan repayment history retrieved successfully.",
                data = result
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
