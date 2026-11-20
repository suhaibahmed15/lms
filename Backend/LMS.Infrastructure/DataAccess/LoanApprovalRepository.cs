
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanApprovalRepository : ILoanApprovalRepository
{
    private readonly ApplicationDbContext _context;

    public LoanApprovalRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get active user with role
    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted &&
                u.Role != null &&
                u.Role.IsActive &&
                !u.Role.IsDeleted);
    }

    // Get application with current status
    public async Task<LoanApplication?> GetApplicationForDecisionAsync(
        int applicationId)
    {
        return await _context.LoanApplications
            .Include(a => a.Status)
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                !a.IsDeleted);
    }

    // Get active status by key and category
    public async Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category)
    {
        return await _context.Statuses
            .FirstOrDefaultAsync(s =>
                s.Key == statusKey &&
                s.Category == category &&
                s.IsActive &&
                !s.IsDeleted);
    }

    // Save application decision and approval history together
    public async Task<int> SaveDecisionAsync(
     LoanApplication application,
     LoanApproval approval)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.LoanApprovals.AddAsync(approval);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return approval.Id;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
