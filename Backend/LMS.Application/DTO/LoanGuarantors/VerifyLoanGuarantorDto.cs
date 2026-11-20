
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanGuarantors;

public class VerifyLoanGuarantorDto
{
    [StringLength(500)]
    public string? VerificationRemarks { get; set; }
}
