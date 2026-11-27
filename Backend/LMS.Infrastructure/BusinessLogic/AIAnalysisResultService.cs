
using System.Text.Json;
using LMS.Application.DTO.AI;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;

namespace LMS.Infrastructure.BusinessLogic;

public class AIAnalysisResultService : IAIAnalysisResultService
{
    private readonly IAIAnalysisResultRepository _repository;

    public AIAnalysisResultService(
        IAIAnalysisResultRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<AIAnalysisResultResponseDto>> GetHistoryAsync(
        int loanApplicationId)
    {
        var records = await _repository.GetHistoryAsync(loanApplicationId);

        return records.Select(record => new AIAnalysisResultResponseDto
        {
            Id = record.Id,
            LoanApplicationId = record.LoanApplicationId,
            Analysis = record.Analysis,
            Summary = record.Summary,
            RiskLevel = record.RiskLevel,
            Recommendations = JsonSerializer.Deserialize<List<string>>(
                record.Recommendations) ?? new List<string>(),
            GeneratedAt = record.GeneratedAt
        }).ToList();
    }

    public async Task<AIAnalysisResultResponseDto?> GetByIdAsync(int id)
    {
        var record = await _repository.GetByIdAsync(id);

        if (record == null)
        {
            return null;
        }

        return new AIAnalysisResultResponseDto
        {
            Id = record.Id,
            LoanApplicationId = record.LoanApplicationId,
            Analysis = record.Analysis,
            Summary = record.Summary,
            RiskLevel = record.RiskLevel,
            Recommendations = JsonSerializer.Deserialize<List<string>>(
                record.Recommendations) ?? new List<string>(),
            GeneratedAt = record.GeneratedAt
        };
    }
}
