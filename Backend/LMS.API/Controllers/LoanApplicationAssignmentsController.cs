
using LMS.Application.DTO.LoanApplications;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanApplicationAssignmentsController : ControllerBase
{
    private readonly ILoanApplicationAssignmentService _service;

    public LoanApplicationAssignmentsController(
        ILoanApplicationAssignmentService service)
    {
        _service = service;
    }

    [HttpPost("{applicationId:int}/assign")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_ASSIGN")]
    public async Task<IActionResult> Assign(
        int applicationId,
        [FromBody] AssignLoanApplicationDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var managerId) || managerId <= 0)
            return Unauthorized(new { message = "Invalid user token." });

        try
        {

            await _service.AssignAsync(
                applicationId,
                dto.AssignedToUserId,
                managerId);


            return Ok(new
            {
                message = "Loan application assigned successfully."
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
 