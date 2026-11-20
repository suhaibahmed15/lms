
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanDocuments;

public class RejectLoanDocumentDto
{
    [Required(ErrorMessage = "Rejection remarks are required.")]
    [StringLength(
        500,
        MinimumLength = 5,
        ErrorMessage = "Rejection remarks must be between 5 and 500 characters.")]
    public string RejectionRemarks { get; set; } = string.Empty;
}
