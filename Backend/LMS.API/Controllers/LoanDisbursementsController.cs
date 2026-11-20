
using LMS.Application.DTO.Loans;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanDisbursementsController : ControllerBase
{
    private readonly ILoanDisbursementService _service;

    public LoanDisbursementsController(
        ILoanDisbursementService service)
    {
        _service = service;
    }

    [HttpPost("{applicationId:int}/disburse")]
    [Authorize(Policy = "Permission:LOAN_DISBURSE")]
    public async Task<IActionResult> Disburse(
        int applicationId,
        [FromBody] DisburseLoanDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
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
            var loanId = await _service.DisburseAsync(
                applicationId,
                userId,
                dto);

            return Ok(new
            {
                message = "Loan disbursed successfully.",
                loanId,
                applicationId,
                decision = "DISBURSED"
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
