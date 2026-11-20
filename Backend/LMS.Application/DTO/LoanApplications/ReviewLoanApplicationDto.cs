
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanApplications;

public class ReviewLoanApplicationDto
{
    [Required]
    public string StatusKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Remarks { get; set; } = string.Empty;
}
