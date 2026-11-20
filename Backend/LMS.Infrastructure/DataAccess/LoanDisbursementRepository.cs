
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanDisbursementRepository : ILoanDisbursementRepository
{
    private readonly ApplicationDbContext _context;

    public LoanDisbursementRepository(ApplicationDbContext context)
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

    // Get only approved loan application
    public async Task<LoanApplication?> GetApprovedApplicationAsync(
        int applicationId)
    {
        return await _context.LoanApplications
            .Include(a => a.Status)
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                !a.IsDeleted &&
                a.Status.Key == "APPLICATION_APPROVED");
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

    // Check whether a loan already exists
    public async Task<bool> LoanExistsForApplicationAsync(
        int applicationId)
    {
        return await _context.Loans
            .AnyAsync(l =>
                l.LoanApplicationId == applicationId &&
                !l.IsDeleted);
    }

    // Save new loan
    public async Task<int> CreateLoanAsync(Loan loan)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.Loans.AddAsync(loan);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return loan.Id;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
