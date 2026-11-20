
namespace LMS.Application.DTO.LoanGuarantors;

public class LoanGuarantorResponseDto
{
    // Guarantor Information
    public int Id { get; set; }
    public int LoanApplicationId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? NationalIdNumber { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? RelationshipToApplicant { get; set; }
    public string? Address { get; set; }

    // Status
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;

    // Verification
    public int? VerifiedByUserId { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationRemarks { get; set; }

    // Rejection
    public int? RejectedByUserId { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionRemarks { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
}
