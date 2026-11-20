
using LMS.Application.DTO.LoanApprovals;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanApprovalsController : ControllerBase
{
    private readonly ILoanApprovalService _service;

    public LoanApprovalsController(ILoanApprovalService service)
    {
        _service = service;
    }

    // Approve loan application
    [HttpPost("{applicationId:int}/approve")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_APPROVE")]
    public async Task<IActionResult> Approve(
        int applicationId,
        [FromBody] LoanApprovalDecisionDto dto)
    {
        return await MakeDecision(applicationId, true, dto);
    }

    // Reject loan application
    [HttpPost("{applicationId:int}/reject")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_REJECT")]
    public async Task<IActionResult> Reject(
        int applicationId,
        [FromBody] LoanApprovalDecisionDto dto)
    {
        return await MakeDecision(applicationId, false, dto);
    }

    // Process final decision
    private async Task<IActionResult> MakeDecision(
        int applicationId,
        bool isApproved,
        LoanApprovalDecisionDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int decisionByUserId))
        {
            return Unauthorized(new
            {
                message = "Invalid user token."
            });
        }

        try
        {
            var approvalId = await _service.DecideAsync(
                applicationId,
                decisionByUserId,
                isApproved,
                dto);

            return Ok(new
            {
                message = isApproved
                    ? "Loan application approved successfully."
                    : "Loan application rejected successfully.",
                approvalId,
                applicationId,
                decision = isApproved ? "APPROVED" : "REJECTED"
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
