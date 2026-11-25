
using LMS.Application.DTO.LoanApplications;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanApplicationsController : ControllerBase
{
    private readonly ILoanApplicationService _loanApplicationService;

    public LoanApplicationsController(
        ILoanApplicationService loanApplicationService)
    {
        _loanApplicationService = loanApplicationService;
    }

    // POST: api/LoanApplications
    // Customer submits a new loan application
    [HttpPost]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_CREATE")]
    public async Task<IActionResult> Create(
        [FromBody] CreateLoanApplicationDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user token."
            });
        }

        try
        {
            var applicationId =
                await _loanApplicationService.CreateAsync(userId, dto);

            return Ok(new
            {
                message = "Loan application submitted successfully.",
                id = applicationId,
                applicationId,
                data = new { id = applicationId, applicationId }
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
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // GET: api/LoanApplications
    // Returns applications according to logged-in user's role
    [HttpGet]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_VIEW")]
    public async Task<IActionResult> GetAll()
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user token."
            });
        }

        try
        {
            var result = await _loanApplicationService.GetPagedAsync(userId);

            return Ok(result);
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


    [HttpPut("{applicationId:int}/review")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_REVIEW")]
    public async Task<IActionResult> Review(
        int applicationId,
        [FromBody] ReviewLoanApplicationDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var officerId) || officerId <= 0)
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _loanApplicationService.ReviewAsync(
                applicationId, officerId, dto);

            return Ok(new
            {
                message = "Loan application reviewed successfully."
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
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
