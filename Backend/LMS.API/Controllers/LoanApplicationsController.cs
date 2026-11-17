
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
    public async Task<IActionResult> Create(
        [FromBody] CreateLoanApplicationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(userIdClaim.Value, out int userId))
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
                applicationId
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
    public async Task<IActionResult> GetAll()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user token."
            });
        }

        try
        {
            var applications =
                await _loanApplicationService.GetAllAsync(userId);

            return Ok(applications);
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
    