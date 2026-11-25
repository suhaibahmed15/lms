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

    public LoanDocumentsController(ILoanDocumentService loanDocumentService)
    {
        _loanDocumentService = loanDocumentService;
    }

    // POST: api/LoanDocuments
    // Upload document against a loan application
    [HttpPost]
    [Authorize(Policy = "Permission:LOAN_DOCUMENT_UPLOAD")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        [FromForm] CreateLoanDocumentDto dto)
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
            var documentId = await _loanDocumentService.UploadAsync(
                userId,
                dto);

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
            var documents = await _loanDocumentService.GetByApplicationIdAsync(
                userId,
                applicationId);

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

    // GET: api/LoanDocuments/{documentId}
    // Get details of a single loan document
    [HttpGet("{documentId:int}")]
    [Authorize(Policy = "Permission:LOAN_DOCUMENT_VIEW")]
    public async Task<IActionResult> GetById(int documentId)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        try
        {
            var document = await _loanDocumentService.GetByIdAsync(userId, documentId);
            return Ok(new
            {
                message = "Loan document retrieved successfully.",
                data = document
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

    // GET: api/LoanDocuments/{documentId}/download
    // Securely download or stream document file
    [HttpGet("{documentId:int}/download")]
    [Authorize(Policy = "Permission:LOAN_DOCUMENT_VIEW")]
    public async Task<IActionResult> Download(int documentId)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        try
        {
            var (fileBytes, contentType, fileName) = await _loanDocumentService.DownloadAsync(userId, documentId);
            return File(fileBytes, contentType, fileName);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    // PUT: api/LoanDocuments/{documentId}/verify
    // Verify an uploaded loan document
    [HttpPut("{documentId:int}/verify")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_REVIEW")]
    public async Task<IActionResult> Verify(
        int documentId,
        [FromBody] VerifyLoanDocumentDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        try
        {
            await _loanDocumentService.VerifyAsync(userId, documentId, dto);
            return Ok(new
            {
                message = "Loan document verified successfully.",
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/LoanDocuments/{documentId}/reject
    // Reject an uploaded loan document with remarks
    [HttpPut("{documentId:int}/reject")]
    [Authorize(Policy = "Permission:LOAN_APPLICATION_REVIEW")]
    public async Task<IActionResult> Reject(
        int documentId,
        [FromBody] RejectLoanDocumentDto dto)
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) ||
            !int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        try
        {
            await _loanDocumentService.RejectAsync(userId, documentId, dto);
            return Ok(new
            {
                message = "Loan document rejected successfully.",
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
    }
}
