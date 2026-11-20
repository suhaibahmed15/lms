using LMS.Application.DTO.Repayments;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RepaymentsController : ControllerBase
{
    private readonly IRepaymentService _service;

    public RepaymentsController(IRepaymentService service)
    {
        _service = service;
    }

    // Customer submits payment
    [HttpPost]
    [Authorize(Policy = "Permission:REPAYMENT_CREATE")]
    public async Task<IActionResult> Create(
        [FromBody] CreateRepaymentDto dto)
    {
        var userIdValue =
            User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId) || userId <= 0)
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var repaymentId = await _service.CreateAsync(userId, dto);

            return Ok(new
            {
                message = "Payment submitted successfully. Awaiting verification.",
                repaymentId
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

    // Admin / Manager views pending payments
    [HttpGet("pending")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> GetPendingPayments()
    {
        var payments = await _service.GetPendingPaymentsAsync();

        var result = payments.Select(x => new
        {
            x.Id,
            x.LoanId,
            x.RepaymentScheduleId,
            x.PaymentReference,
            x.Amount,
            x.PaymentMethod,
            x.PaidAt,
            x.StatusId,
            Status = x.Status.Key,
            BorrowerUserId = x.Loan.BorrowerUserId,
            BorrowerName = x.Loan.BorrowerUser.FullName,
            x.Remarks,
            x.CreatedAt
        });

        return Ok(new
        {
            message = "Pending payments retrieved successfully.",
            data = result
        });
    }

    // Admin / Manager verifies payment
    [HttpPost("{id:int}/verify")]
    [Authorize(Policy = "Permission:REPAYMENT_VERIFY")]
    public async Task<IActionResult> Verify(
        int id,
        [FromBody] PaymentDecisionDto dto)
    {
        var userIdValue =
            User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId) || userId <= 0)
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _service.VerifyAsync(id, userId, dto);

            return Ok(new
            {
                message = "Payment verified successfully.",
                repaymentId = id,
                decision = "COMPLETED"
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Admin / Manager rejects payment
    [HttpPost("{id:int}/reject")]
    [Authorize(Policy = "Permission:REPAYMENT_VERIFY")]
    public async Task<IActionResult> Reject(
        int id,
        [FromBody] PaymentDecisionDto dto)
    {
        var userIdValue =
            User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId) || userId <= 0)
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _service.RejectAsync(id, userId, dto);

            return Ok(new
            {
                message = "Payment rejected successfully.",
                repaymentId = id,
                decision = "FAILED"
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}