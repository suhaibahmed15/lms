
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IAIPromptRepository
{
    Task<IEnumerable<AIPrompt>> GetAllAsync();

    Task<AIPrompt?> GetByIdAsync(int id);

    Task<AIPrompt?> GetByKeyAsync(string promptKey);

    Task AddAsync(AIPrompt prompt);

    void Update(AIPrompt prompt);

    Task<bool> ExistsByKeyAsync(string promptKey, int? excludeId = null);

    Task SaveChangesAsync();
}
