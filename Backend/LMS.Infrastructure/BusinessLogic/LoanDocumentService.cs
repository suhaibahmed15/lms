
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

        if (!AllowedFileTypes.TryGetValue(extension, out var expectedContentType))
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
            Id = d.Id,
            LoanApplicationId = d.LoanApplicationId,
            DocumentType = d.DocumentType,
            FileName = d.FileName,
            ContentType = d.ContentType,
            FileSizeBytes = d.FileSizeBytes,
            UploadedByUserId = d.UploadedByUserId,
            IsVerified = d.IsVerified,
            CreatedAt = d.CreatedAt
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

        if (document.IsVerified)
        {
            throw new InvalidOperationException(
                "This document has already been verified.");
        }

        document.IsVerified = true;
        document.VerifiedByUserId = userId;
        document.VerifiedAt = DateTime.UtcNow;
        document.VerificationRemarks = dto.VerificationRemarks?.Trim();

        await _repository.SaveChangesAsync();
    }
}
