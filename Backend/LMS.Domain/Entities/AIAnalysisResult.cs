
namespace LMS.Domain.Entities;

public class AIAnalysisResult : BaseEntity
{
    public int LoanApplicationId { get; set; }

    public string Analysis { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string RiskLevel { get; set; } = string.Empty;

    // Recommendations will be stored as JSON
    public string Recommendations { get; set; } = "[]";

    public DateTime GeneratedAt { get; set; }

    // Relationship
    public LoanApplication LoanApplication { get; set; } = null!;
}
