using LMS.Application.DTO.LoanGuarantors;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanGuarantorsController : ControllerBase
{
    private readonly ILoanGuarantorService _service;

    public LoanGuarantorsController(ILoanGuarantorService service)
    {
        _service = service;
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdValue = User.FindFirst("UserId")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return int.TryParse(userIdValue, out userId) && userId > 0;
    }

    // POST: api/LoanGuarantors
    [HttpPost]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_CREATE")]
    public async Task<IActionResult> Create([FromBody] CreateLoanGuarantorDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var id = await _service.CreateAsync(userId, dto);
            return Ok(new
            {
                message = "Loan guarantor created successfully.",
                data = new { id }
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

    // GET: api/LoanGuarantors/application/{applicationId}
    [HttpGet("application/{applicationId:int}")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_VIEW")]
    public async Task<IActionResult> GetByApplication(int applicationId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _service.GetByApplicationIdAsync(userId, applicationId);
            return Ok(new
            {
                message = "Loan guarantors retrieved successfully.",
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

    // GET: api/LoanGuarantors/{guarantorId}
    [HttpGet("{guarantorId:int}")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_VIEW")]
    public async Task<IActionResult> GetById(int guarantorId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var result = await _service.GetByIdAsync(userId, guarantorId);
            return Ok(new
            {
                message = "Loan guarantor retrieved successfully.",
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

    // PUT: api/LoanGuarantors/{guarantorId}
    [HttpPut("{guarantorId:int}")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_CREATE")]
    public async Task<IActionResult> Update(
        int guarantorId,
        [FromBody] UpdateLoanGuarantorDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _service.UpdateAsync(userId, guarantorId, dto);
            return Ok(new
            {
                message = "Loan guarantor updated successfully.",
                guarantorId
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

    // DELETE: api/LoanGuarantors/{guarantorId}
    [HttpDelete("{guarantorId:int}")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_CREATE")]
    public async Task<IActionResult> Delete(int guarantorId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _service.DeleteAsync(userId, guarantorId);
            return Ok(new
            {
                message = "Loan guarantor removed successfully.",
                guarantorId
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

    // PUT: api/LoanGuarantors/{guarantorId}/verify
    [HttpPut("{guarantorId:int}/verify")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_REVIEW")]
    public async Task<IActionResult> Verify(
        int guarantorId,
        [FromBody] VerifyLoanGuarantorDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _service.VerifyAsync(userId, guarantorId, dto);
            return Ok(new
            {
                message = "Loan guarantor verified successfully.",
                guarantorId
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

    // PUT: api/LoanGuarantors/{guarantorId}/reject
    [HttpPut("{guarantorId:int}/reject")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_REVIEW")]
    public async Task<IActionResult> Reject(
        int guarantorId,
        [FromBody] RejectLoanGuarantorDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _service.RejectAsync(userId, guarantorId, dto);
            return Ok(new
            {
                message = "Loan guarantor rejected successfully.",
                guarantorId
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
