namespace LMS.Domain.Entities;

public class LoanDocument : BaseEntity
{
    public int LoanApplicationId { get; set; }
    public int StatusId { get; set; }

    public string DocumentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public int UploadedByUserId { get; set; }

    // Temporary: remove after old workflow is fully migrated
    public bool IsVerified { get; set; }

    // Verification details
    public int? VerifiedByUserId { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationRemarks { get; set; }

    // Rejection details
    public int? RejectedByUserId { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionRemarks { get; set; }

    // Navigation properties
    public LoanApplication LoanApplication { get; set; } = null!;
    public Status Status { get; set; } = null!;

    public User UploadedByUser { get; set; } = null!;
    public User? VerifiedByUser { get; set; }
    public User? RejectedByUser { get; set; }
}