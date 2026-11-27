
using LMS.Application.DTO.AI;

namespace LMS.Application.Services.Interfaces;

public interface IAIPromptService
{
    Task<IEnumerable<AIPromptResponseDto>> GetAllAsync();

    Task<AIPromptResponseDto?> GetByIdAsync(int id);

    Task<AIPromptResponseDto?> GetActiveByKeyAsync(string promptKey);

    Task<AIPromptResponseDto> CreateAsync(CreateAIPromptDto dto);

    Task<AIPromptResponseDto?> UpdateAsync(int id, UpdateAIPromptDto dto);

    Task<bool> DeleteAsync(int id);
}
