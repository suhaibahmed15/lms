
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanGuarantorRepository : ILoanGuarantorRepository
{
    private readonly ApplicationDbContext _context;

    public LoanGuarantorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LoanApplication?> GetApplicationByIdAsync(
        int applicationId)
    {
        return await _context.LoanApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                !a.IsDeleted);
    }

    public async Task<Status?> GetStatusByCategoryAndKeyAsync(
        string category,
        string key)
    {
        return await _context.Statuses
            .FirstOrDefaultAsync(s =>
                s.Category == category &&
                s.Key == key &&
                s.IsActive &&
                !s.IsDeleted);
    }

    public async Task<List<LoanGuarantor>> GetByApplicationIdAsync(
        int applicationId)
    {
        return await _context.LoanGuarantors
            .AsNoTracking()
            .Include(g => g.Status)
            .Where(g =>
                g.LoanApplicationId == applicationId &&
                !g.IsDeleted)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<LoanGuarantor?> GetByIdAsync(int guarantorId)
    {
        return await _context.LoanGuarantors
            .Include(g => g.Status)
            .FirstOrDefaultAsync(g =>
                g.Id == guarantorId &&
                !g.IsDeleted);
    }

    public async Task AddAsync(LoanGuarantor guarantor)
    {
        await _context.LoanGuarantors.AddAsync(guarantor);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
