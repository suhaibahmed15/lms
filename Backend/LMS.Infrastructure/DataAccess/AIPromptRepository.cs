
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class AIPromptRepository : IAIPromptRepository
{
    private readonly ApplicationDbContext _context;

    public AIPromptRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AIPrompt>> GetAllAsync()
    {
        return await _context.AIPrompts
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<AIPrompt?> GetByIdAsync(int id)
    {
        return await _context.AIPrompts
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
    }

    public async Task<AIPrompt?> GetByKeyAsync(string promptKey)
    {
        return await _context.AIPrompts
            .FirstOrDefaultAsync(x =>
                x.PromptKey == promptKey &&
                x.IsActive &&
                !x.IsDeleted);
    }

    public async Task AddAsync(AIPrompt prompt)
    {
        await _context.AIPrompts.AddAsync(prompt);
    }

    public void Update(AIPrompt prompt)
    {
        _context.AIPrompts.Update(prompt);
    }

    public async Task<bool> ExistsByKeyAsync(
        string promptKey,
        int? excludeId = null)
    {
        return await _context.AIPrompts.AnyAsync(x =>
            x.PromptKey == promptKey &&
            !x.IsDeleted &&
            (!excludeId.HasValue || x.Id != excludeId.Value));
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
