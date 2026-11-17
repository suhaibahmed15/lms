
using LMS.Application.DTO.Dashboard;
using LMS.Application.Repositories.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class DashboardRepository : IDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public DashboardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(int userId)
    {
        // Get user with role
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted);

        if (user == null)
            throw new InvalidOperationException("User not found or inactive.");

        var roleKey = user.Role.Key;

        // Base queries
        var applicationsQuery = _context.LoanApplications
            .AsNoTracking()
            .Where(a => !a.IsDeleted);

        var loansQuery = _context.Loans
            .AsNoTracking()
            .Where(l => !l.IsDeleted);

        var totalUsers = 0;

        // ADMIN: Complete system access
        if (roleKey == "ADMIN")
        {
            totalUsers = await _context.Users
                .CountAsync(u => u.IsActive && !u.IsDeleted);
        }

        // BRANCH MANAGER: Applications assigned by Admin,
        // including applications later delegated to Loan Officers
        else if (roleKey == "MANAGER")
        {
            var assignedApplicationIds = _context.LoanApplicationAssignments
                .Where(x =>
                    x.AssignedToUserId == userId &&
                    !x.IsDeleted)
                .Select(x => x.LoanApplicationId)
                .Distinct();

            applicationsQuery = applicationsQuery
                .Where(a => assignedApplicationIds.Contains(a.Id));

            loansQuery = loansQuery
                .Where(l => assignedApplicationIds.Contains(l.LoanApplicationId));
        }

        // LOAN OFFICER: Currently assigned applications
        else if (roleKey == "LOAN_OFFICER")
        {
            applicationsQuery = applicationsQuery
                .Where(a => a.AssignedToUserId == userId);

            var assignedApplicationIds = applicationsQuery
                .Select(a => a.Id);

            loansQuery = loansQuery
                .Where(l => assignedApplicationIds.Contains(l.LoanApplicationId));
        }

        // CUSTOMER: Own submitted applications and loans
        else if (roleKey == "CUSTOMER")
        {
            applicationsQuery = applicationsQuery
                .Where(a => a.ApplicantUserId == userId);

            loansQuery = loansQuery
                .Where(l => l.BorrowerUserId == userId);
        }
        else
        {
            throw new InvalidOperationException("Invalid user role.");
        }

        // Application statistics
        var totalApplications = await applicationsQuery.CountAsync();

        var pendingApplications = await applicationsQuery
            .CountAsync(a =>
                a.Status.Key == "APPLICATION_SUBMITTED" ||
                a.Status.Key == "APPLICATION_UNDER_REVIEW" ||
                a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");

        var approvedApplications = await applicationsQuery
            .CountAsync(a =>
                a.Status.Key == "APPLICATION_APPROVED");

        var rejectedApplications = await applicationsQuery
            .CountAsync(a =>
                a.Status.Key == "APPLICATION_REJECTED");

        // Loan statistics
        var totalLoans = await loansQuery.CountAsync();

        var activeLoans = await loansQuery
            .CountAsync(l => l.Status.Key == "LOAN_ACTIVE");

        var outstandingAmount = await loansQuery
            .SumAsync(l => (decimal?)l.OutstandingBalance) ?? 0;

        // Dashboard response
        return new DashboardSummaryDto
        {
            TotalUsers = totalUsers,
            TotalApplications = totalApplications,
            PendingApplications = pendingApplications,
            ApprovedApplications = approvedApplications,
            RejectedApplications = rejectedApplications,
            TotalLoans = totalLoans,
            ActiveLoans = activeLoans,
            TotalOutstandingAmount = outstandingAmount
        };
    }
}
