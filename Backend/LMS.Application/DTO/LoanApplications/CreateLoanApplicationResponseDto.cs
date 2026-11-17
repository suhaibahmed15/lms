
namespace LMS.Application.DTO.LoanApplications;

public class LoanApplicationResponseDto
{
    public int Id { get; set; }
    public string ApplicationNumber { get; set; } = string.Empty;

    public int ApplicantUserId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;

    public int LoanTypeId { get; set; }
    public string LoanTypeName { get; set; } = string.Empty;

    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;

    public decimal RequestedAmount { get; set; }
    public int RequestedTermMonths { get; set; }

    public string? Purpose { get; set; }
    public DateTime? SubmittedAt { get; set; }

    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }

    public DateTime CreatedAt { get; set; }
}
