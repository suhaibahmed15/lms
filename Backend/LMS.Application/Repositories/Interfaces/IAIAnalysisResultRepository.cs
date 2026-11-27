
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IAIAnalysisResultRepository
{
    Task AddAsync(AIAnalysisResult result);

    Task<List<AIAnalysisResult>> GetHistoryAsync(int loanApplicationId);

    Task<AIAnalysisResult?> GetByIdAsync(int id);
}
