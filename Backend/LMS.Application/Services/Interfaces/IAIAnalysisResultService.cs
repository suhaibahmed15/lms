
using LMS.Application.DTO.AI;

namespace LMS.Application.Services.Interfaces;

public interface IAIAnalysisResultService
{
    Task<List<AIAnalysisResultResponseDto>> GetHistoryAsync(
        int loanApplicationId);

    Task<AIAnalysisResultResponseDto?> GetByIdAsync(int id);
}
