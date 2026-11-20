
using LMS.Application.DTO.LoanDocuments;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Hosting;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanDocumentService : ILoanDocumentService
{
    private readonly ILoanDocumentRepository _repository;
    private readonly IWebHostEnvironment _environment;

    private const long MaxFileSize = 5 * 1024 * 1024;

    private const string DocumentCategory = "LoanDocument";
    private const string PendingStatus = "DOCUMENT_PENDING";
    private const string VerifiedStatus = "DOCUMENT_VERIFIED";
    private const string RejectedStatus = "DOCUMENT_REJECTED";

    private static readonly Dictionary<string, string> AllowedFileTypes = new()
    {
        { ".pdf", "application/pdf" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" }
    };

    public LoanDocumentService(
        ILoanDocumentRepository repository,
        IWebHostEnvironment environment)
    {
        _repository = repository;
        _environment = environment;
    }

    // POST: Upload loan document
    public async Task<int> UploadAsync(
        int userId,
        CreateLoanDocumentDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
            throw new ArgumentException("Please select a valid file.");

        if (dto.File.Length > MaxFileSize)
            throw new ArgumentException("File size cannot exceed 5 MB.");

        var extension = Path.GetExtension(dto.File.FileName)
            .ToLowerInvariant();

        if (!AllowedFileTypes.TryGetValue(
            extension,
            out var expectedContentType))
        {
            throw new ArgumentException(
                "Only PDF, JPG, JPEG and PNG files are allowed.");
        }

        if (!string.Equals(
            dto.File.ContentType,
            expectedContentType,
            StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException(
                "File content type does not match its extension.");
        }

        var documentType = dto.DocumentType?.Trim();

        if (string.IsNullOrWhiteSpace(documentType))
            throw new ArgumentException("Document type is required.");

        var application = await _repository.GetApplicationByIdAsync(
            dto.LoanApplicationId);

        if (application == null)
            throw new KeyNotFoundException("Loan application not found.");

        if (application.ApplicantUserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only upload documents for your own loan application.");
        }

        var documentExists = await _repository.DocumentExistsAsync(
            dto.LoanApplicationId,
            userId,
            documentType);

        if (documentExists)
        {
            throw new InvalidOperationException(
                "This document type has already been uploaded for this application.");
        }

        var pendingStatus = await _repository.GetStatusByCategoryAndKeyAsync(
            DocumentCategory,
            PendingStatus);

        if (pendingStatus == null)
        {
            throw new InvalidOperationException(
                "Loan document Pending status was not found or is inactive.");
        }

        var webRootPath = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(
                _environment.ContentRootPath,
                "wwwroot");
        }

        var uploadFolder = Path.Combine(
            webRootPath,
            "uploads",
            "loan-documents");

        Directory.CreateDirectory(uploadFolder);

        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var fullFilePath = Path.Combine(uploadFolder, storedFileName);

        var relativeFilePath =
            $"/uploads/loan-documents/{storedFileName}";

        try
        {
            await using (var stream = new FileStream(
                fullFilePath,
                FileMode.CreateNew,
                FileAccess.Write))
            {
                await dto.File.CopyToAsync(stream);
            }

            var document = new LoanDocument
            {
                LoanApplicationId = dto.LoanApplicationId,
                DocumentType = documentType,
                FileName = Path.GetFileName(dto.File.FileName),
                FilePath = relativeFilePath,
                ContentType = expectedContentType,
                FileSizeBytes = dto.File.Length,
                UploadedByUserId = userId,
                StatusId = pendingStatus.Id,
                IsVerified = false
            };

            await _repository.AddAsync(document);
            await _repository.SaveChangesAsync();

            return document.Id;
        }
        catch
        {
            if (File.Exists(fullFilePath))
                File.Delete(fullFilePath);

            throw;
        }
    }

    // GET: Get documents by loan application ID
    public async Task<List<LoanDocumentResponseDto>> GetByApplicationIdAsync(
        int userId,
        int applicationId)
    {
        var application = await _repository.GetApplicationByIdAsync(
            applicationId);

        if (application == null)
            throw new KeyNotFoundException("Loan application not found.");

        if (application.ApplicantUserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only view documents of your own loan application.");
        }

        var documents = await _repository.GetDocumentsByApplicationIdAsync(
            applicationId);

        return documents.Select(d => new LoanDocumentResponseDto
        {
            // Document Information
            Id = d.Id,
            LoanApplicationId = d.LoanApplicationId,
            DocumentType = d.DocumentType,
            FileName = d.FileName,
            ContentType = d.ContentType,
            FileSizeBytes = d.FileSizeBytes,

            // Upload Information
            UploadedByUserId = d.UploadedByUserId,
            CreatedAt = d.CreatedAt,

            // Status Information
            StatusId = d.StatusId,
            StatusName = d.Status.Name,
            StatusKey = d.Status.Key,
            IsVerified = d.IsVerified,

            // Verification Information
            VerifiedByUserId = d.VerifiedByUserId,
            VerifiedAt = d.VerifiedAt,
            VerificationRemarks = d.VerificationRemarks,

            // Rejection Information
            RejectedByUserId = d.RejectedByUserId,
            RejectedAt = d.RejectedAt,
            RejectionRemarks = d.RejectionRemarks

        }).ToList();
    }

    // PUT: Verify loan document
    public async Task VerifyAsync(
        int userId,
        int documentId,
        VerifyLoanDocumentDto dto)
    {
        var document = await _repository.GetDocumentByIdAsync(documentId);

        if (document == null)
            throw new KeyNotFoundException("Loan document not found.");

        if (document.Status.Key != PendingStatus)
        {
            throw new InvalidOperationException(
                "Only pending documents can be verified.");
        }

        var verifiedStatus = await _repository.GetStatusByCategoryAndKeyAsync(
            DocumentCategory,
            VerifiedStatus);

        if (verifiedStatus == null)
        {
            throw new InvalidOperationException(
                "Loan document Verified status was not found or is inactive.");
        }

        document.StatusId = verifiedStatus.Id;

        document.IsVerified = true;
        document.VerifiedByUserId = userId;
        document.VerifiedAt = DateTime.UtcNow;
        document.VerificationRemarks = dto.VerificationRemarks?.Trim();

        await _repository.SaveChangesAsync();
    }

    // PUT: Reject loan document
    public async Task RejectAsync(
        int userId,
        int documentId,
        RejectLoanDocumentDto dto)
    {
        var document = await _repository.GetDocumentByIdAsync(documentId);

        if (document == null)
            throw new KeyNotFoundException("Loan document not found.");

        if (document.Status.Key != PendingStatus)
        {
            throw new InvalidOperationException(
                "Only pending documents can be rejected.");
        }

        var rejectionRemarks = dto.RejectionRemarks?.Trim();

        if (string.IsNullOrWhiteSpace(rejectionRemarks))
        {
            throw new ArgumentException(
                "Rejection remarks are required.");
        }

        var rejectedStatus = await _repository.GetStatusByCategoryAndKeyAsync(
            DocumentCategory,
            RejectedStatus);

        if (rejectedStatus == null)
        {
            throw new InvalidOperationException(
                "Loan document Rejected status was not found or is inactive.");
        }

        document.StatusId = rejectedStatus.Id;
        document.IsVerified = false;

        document.RejectedByUserId = userId;
        document.RejectedAt = DateTime.UtcNow;
        document.RejectionRemarks = rejectionRemarks;

        await _repository.SaveChangesAsync();
    }
}
