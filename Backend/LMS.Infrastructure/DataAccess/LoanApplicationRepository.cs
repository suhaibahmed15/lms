
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanApplicationRepository : ILoanApplicationRepository
{
    private readonly ApplicationDbContext _context;

    public LoanApplicationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get active user by ID
    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted &&
                u.Role.IsActive &&
                !u.Role.IsDeleted);
    }

    // Get active Loan Type by ID
    public async Task<LoanType?> GetActiveLoanTypeByIdAsync(int loanTypeId)
    {
        return await _context.LoanTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(lt =>
                lt.Id == loanTypeId &&
                lt.IsActive &&
                !lt.IsDeleted);
    }

    // Get Application Status by Key
    public async Task<Status?> GetStatusByKeyAsync(string statusKey)
    {
        return await _context.Statuses
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.Key == statusKey &&
                s.Category == "Application" &&
                s.IsActive &&
                !s.IsDeleted);
    }

    // Add new Loan Application
    public async Task AddAsync(LoanApplication application)
    {
        await _context.LoanApplications.AddAsync(application);
    }

    // Save changes to database
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    // Get all loan applications with related data
    public async Task<List<LoanApplication>> GetAllAsync()
    {
        return await _context.LoanApplications
            .AsNoTracking()
            .Include(a => a.ApplicantUser)
            .Include(a => a.LoanType)
            .Include(a => a.Status)
            .Include(a => a.AssignedToUser)
            .Include(a => a.Assignments)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }
}
    