
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanApprovals;

public class LoanApprovalDecisionDto
{
    [MaxLength(1000, ErrorMessage = "Remarks cannot exceed 1000 characters.")]
    public string? Remarks { get; set; }
}
