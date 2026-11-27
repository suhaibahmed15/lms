
namespace LMS.Application.DTO.AI;

public class LoanApplicationAIDataDto
{
    public int LoanApplicationId { get; set; }

    public decimal RequestedAmount { get; set; }

    public int RequestedTermMonths { get; set; }

    public string? Purpose { get; set; }

    public string LoanTypeName { get; set; } = string.Empty;

    public decimal MinimumLoanAmount { get; set; }

    public decimal MaximumLoanAmount { get; set; }

    public decimal InterestRate { get; set; }

    public int MinimumTermMonths { get; set; }

    public int MaximumTermMonths { get; set; }

    public bool RequiresGuarantor { get; set; }

    public string ApplicationStatus { get; set; } = string.Empty;
}
