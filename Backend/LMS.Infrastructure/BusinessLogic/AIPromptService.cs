
using LMS.Application.DTO.AI;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class AIPromptService : IAIPromptService
{
    private readonly IAIPromptRepository _repository;

    public AIPromptService(IAIPromptRepository repository)
    {
        _repository = repository;
    }

    // Get all prompts
    public async Task<IEnumerable<AIPromptResponseDto>> GetAllAsync()
    {
        var prompts = await _repository.GetAllAsync();

        return prompts.Select(MapToResponse);
    }

    // Get prompt by ID
    public async Task<AIPromptResponseDto?> GetByIdAsync(int id)
    {
        var prompt = await _repository.GetByIdAsync(id);

        if (prompt == null)
            return null;

        return MapToResponse(prompt);
    }

    // Get active prompt by key for AI processing
    public async Task<AIPromptResponseDto?> GetActiveByKeyAsync(
        string promptKey)
    {
        var prompt = await _repository.GetByKeyAsync(
            promptKey.Trim().ToUpperInvariant());

        if (prompt == null)
            return null;

        return MapToResponse(prompt);
    }

    // Create new prompt
    public async Task<AIPromptResponseDto> CreateAsync(
        CreateAIPromptDto dto)
    {
        string promptKey = dto.PromptKey.Trim().ToUpperInvariant();

        bool exists = await _repository.ExistsByKeyAsync(promptKey);

        if (exists)
            throw new InvalidOperationException(
                "A prompt with this key already exists.");

        var prompt = new AIPrompt
        {
            PromptName = dto.PromptName.Trim(),
            PromptKey = promptKey,
            PromptText = dto.PromptText.Trim(),
            Description = dto.Description?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(prompt);
        await _repository.SaveChangesAsync();

        return MapToResponse(prompt);
    }

    // Update existing prompt
    public async Task<AIPromptResponseDto?> UpdateAsync(
        int id,
        UpdateAIPromptDto dto)
    {
        var prompt = await _repository.GetByIdAsync(id);

        if (prompt == null)
            return null;

        string promptKey = dto.PromptKey.Trim().ToUpperInvariant();

        bool exists = await _repository.ExistsByKeyAsync(
            promptKey, id);

        if (exists)
            throw new InvalidOperationException(
                "Another prompt with this key already exists.");

        prompt.PromptName = dto.PromptName.Trim();
        prompt.PromptKey = promptKey;
        prompt.PromptText = dto.PromptText.Trim();
        prompt.Description = dto.Description?.Trim();
        prompt.IsActive = dto.IsActive;
        prompt.UpdatedAt = DateTime.UtcNow;

        _repository.Update(prompt);
        await _repository.SaveChangesAsync();

        return MapToResponse(prompt);
    }

    // Soft delete prompt
    public async Task<bool> DeleteAsync(int id)
    {
        var prompt = await _repository.GetByIdAsync(id);

        if (prompt == null)
            return false;

        prompt.IsDeleted = true;
        prompt.UpdatedAt = DateTime.UtcNow;

        _repository.Update(prompt);
        await _repository.SaveChangesAsync();

        return true;
    }

    // Convert entity into response DTO
    private static AIPromptResponseDto MapToResponse(AIPrompt prompt)
    {
        return new AIPromptResponseDto
        {
            Id = prompt.Id,
            PromptName = prompt.PromptName,
            PromptKey = prompt.PromptKey,
            PromptText = prompt.PromptText,
            Description = prompt.Description,
            IsActive = prompt.IsActive,
            CreatedAt = prompt.CreatedAt,
            UpdatedAt = prompt.UpdatedAt
        };
    }
}
