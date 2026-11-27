
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class AIAnalysisResultRepository : IAIAnalysisResultRepository
{
    private readonly ApplicationDbContext _context;

    public AIAnalysisResultRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AIAnalysisResult result)
    {
        await _context.AIAnalysisResults.AddAsync(result);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AIAnalysisResult>> GetHistoryAsync(int loanApplicationId)
    {
        return await _context.AIAnalysisResults
            .AsNoTracking()
            .Where(x => x.LoanApplicationId == loanApplicationId && !x.IsDeleted)
            .OrderByDescending(x => x.GeneratedAt)
            .ToListAsync();
    }

    public async Task<AIAnalysisResult?> GetByIdAsync(int id)
    {
        return await _context.AIAnalysisResults
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
    }
}
