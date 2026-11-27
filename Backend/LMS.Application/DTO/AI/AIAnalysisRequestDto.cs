
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.AI;

public class AIAnalysisRequestDto
{
    [Required]
    public int LoanApplicationId { get; set; }
}
