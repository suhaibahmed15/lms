namespace LMS.Application.DTO.LoanDocuments;

public class LoanDocumentResponseDto
{
    public int Id { get; set; }

    public int LoanApplicationId { get; set; }

    public string DocumentType { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public int UploadedByUserId { get; set; }

    public bool IsVerified { get; set; }

    public DateTime CreatedAt { get; set; }

    // Status Information
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;

    // Verification Information
    public int? VerifiedByUserId { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationRemarks { get; set; }

    // Rejection Information
    public int? RejectedByUserId { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionRemarks { get; set; }
}
