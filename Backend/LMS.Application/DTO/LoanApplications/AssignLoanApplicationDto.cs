
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanApplications;

public class AssignLoanApplicationDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Please select a valid Loan Officer.")]
    public int AssignedToUserId { get; set; }
}
