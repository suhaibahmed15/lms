
namespace LMS.Application.DTO.AI;

public class AIAnalysisResultResponseDto
{
    public int Id { get; set; }

    public int LoanApplicationId { get; set; }

    public string Analysis { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string RiskLevel { get; set; } = string.Empty;

    public List<string> Recommendations { get; set; } = new();

    public DateTime GeneratedAt { get; set; }
}
