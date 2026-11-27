
using LMS.Application.DTO.AI;

namespace LMS.Application.Services.Interfaces;

public interface IGroqAIService
{
    Task<AIAnalysisResponseDto> AnalyzeLoanApplicationAsync(
        int loanApplicationId
    );
}
