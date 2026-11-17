
namespace LMS.Application.DTO.LoanApplications;

public class CreateLoanApplicationDto
{
    public int LoanTypeId { get; set; }

    public decimal RequestedAmount { get; set; }

    public int RequestedTermMonths { get; set; }

    public string? Purpose { get; set; }
}
