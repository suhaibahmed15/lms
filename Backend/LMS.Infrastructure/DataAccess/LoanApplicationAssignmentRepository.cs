
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanApplicationAssignmentRepository
    : ILoanApplicationAssignmentRepository
{
    private readonly ApplicationDbContext _context;

    public LoanApplicationAssignmentRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // Get user with role
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

    // Get active Loan Officer
    public async Task<User?> GetActiveLoanOfficerByIdAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted &&
                u.Role != null &&
                u.Role.IsActive &&
                !u.Role.IsDeleted &&
                (u.Role.Key == "OFFICER" ||
                 u.Role.Key == "LOAN_OFFICER"));
    }

    // Get application for assignment
    public async Task<LoanApplication?> GetApplicationForAssignmentAsync(
        int applicationId)
    {
        return await _context.LoanApplications
            .Include(a => a.Status)
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                !a.IsDeleted);
    }

    // Save assignment and update current assigned officer
    public async Task<int> AssignAsync(
        LoanApplication application,
        LoanApplicationAssignment assignment)
    {
        application.AssignedToUserId = assignment.AssignedToUserId;

        await _context.LoanApplicationAssignments.AddAsync(assignment);

        // Both changes are saved in one database transaction
        await _context.SaveChangesAsync();

        return assignment.Id;
    }
}
