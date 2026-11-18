
using LMS.Application.DTO.LoanDocuments;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanDocumentsController : ControllerBase
{
    private readonly ILoanDocumentService _loanDocumentService;

    public LoanDocumentsController(
        ILoanDocumentService loanDocumentService)
    {
        _loanDocumentService = loanDocumentService;
    }

    // Get logged-in user ID from JWT
    private bool TryGetUserId(out int userId)
    {
        userId = 0;

        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return !string.IsNullOrWhiteSpace(userIdValue)
            && int.TryParse(userIdValue, out userId);
    }

    // POST: api/LoanDocuments
    // Upload document against a loan application
    [HttpPost]
    [Authorize(Policy = "Permission:LOAN_DOCUMENT_CREATE")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        [FromForm] CreateLoanDocumentDto dto)
    {
        if (!TryGetUserId(out int userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var documentId = await _loanDocumentService.UploadAsync(
                userId, dto);

            return Ok(new
            {
                message = "Loan document uploaded successfully.",
                documentId
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
        catch (IOException)
        {
            return StatusCode(500, new
            {
                message = "An error occurred while saving the uploaded file."
            });
        }
    }

    // GET: api/LoanDocuments/application/{applicationId}
    // Get all documents of a loan application
    [HttpGet("application/{applicationId:int}")]
    [Authorize(Policy = "Permission:LOAN_DOCUMENT_VIEW")]
    public async Task<IActionResult> GetByApplicationId(int applicationId)
    {
        if (!TryGetUserId(out int userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var documents = await _loanDocumentService.GetByApplicationIdAsync(
                userId, applicationId);

            return Ok(new
            {
                message = "Loan documents retrieved successfully.",
                data = documents
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

    // PUT: api/LoanDocuments/{documentId}/verify
    // Verify uploaded loan document
    [HttpPut("{documentId:int}/verify")]
    [Authorize(Policy = "Permission:LOAN_DOCUMENT_VERIFY")]
    public async Task<IActionResult> Verify(
        int documentId,
        [FromBody] VerifyLoanDocumentDto dto)
    {
        if (!TryGetUserId(out int userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            await _loanDocumentService.VerifyAsync(
                userId, documentId, dto);

            return Ok(new
            {
                message = "Loan document verified successfully."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
