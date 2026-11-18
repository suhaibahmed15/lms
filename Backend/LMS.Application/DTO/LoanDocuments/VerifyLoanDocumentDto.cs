using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanDocuments;

public class VerifyLoanDocumentDto
{
    [StringLength(500)]
    public string? VerificationRemarks { get; set; }
}