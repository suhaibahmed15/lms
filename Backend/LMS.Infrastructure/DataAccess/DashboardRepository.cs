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
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted);

        if (user == null)
            throw new InvalidOperationException("User not found or inactive.");

        var roleKey = user.Role.Key.ToUpperInvariant();

        var applicationsQuery = _context.LoanApplications
            .AsNoTracking()
            .Where(a => !a.IsDeleted);

        var loansQuery = _context.Loans
            .AsNoTracking()
            .Where(l => !l.IsDeleted);

        var repaymentsQuery = _context.Repayments
            .AsNoTracking()
            .Where(r => !r.IsDeleted);

        var schedulesQuery = _context.RepaymentSchedules
            .AsNoTracking()
            .Where(s => !s.IsDeleted);

        var dto = new DashboardSummaryDto
        {
            RoleKey = roleKey
        };

        if (roleKey == "ADMIN")
        {
            dto.TotalUsers = await _context.Users.CountAsync(u => u.IsActive && !u.IsDeleted);
            dto.TotalCustomers = await _context.Users.CountAsync(u => u.IsActive && !u.IsDeleted && u.Role.Key == "CUSTOMER");

            dto.TotalApplications = await applicationsQuery.CountAsync();
            dto.PendingApplications = await applicationsQuery.CountAsync(a =>
                a.Status.Key == "APPLICATION_SUBMITTED" ||
                a.Status.Key == "APPLICATION_UNDER_REVIEW" ||
                a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ApplicationsUnderReview = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_UNDER_REVIEW");
            dto.ApplicationsAwaitingDocuments = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ReviewedApplications = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_REVIEWED");
            dto.ApplicationsAwaitingApproval = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_REVIEWED" || a.Status.Key == "APPLICATION_SUBMITTED");
            dto.ApprovedApplications = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_APPROVED");
            dto.RejectedApplications = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_REJECTED");

            dto.TotalLoans = await loansQuery.CountAsync();
            dto.ActiveLoans = await loansQuery.CountAsync(l => l.Status.Key == "LOAN_ACTIVE");
            dto.ClosedLoans = await loansQuery.CountAsync(l => l.Status.Key == "LOAN_CLOSED");
            dto.TotalDisbursedAmount = await loansQuery.SumAsync(l => (decimal?)l.PrincipalAmount) ?? 0;
            dto.TotalOutstandingAmount = await loansQuery.SumAsync(l => (decimal?)l.OutstandingBalance) ?? 0;

            dto.TotalRepayments = await repaymentsQuery.CountAsync();
            dto.PendingRepayments = await repaymentsQuery.CountAsync(r => r.Status.Key == "REPAYMENT_PENDING");
            dto.TotalCollectedRepayments = await repaymentsQuery
                .Where(r => r.Status.Key == "REPAYMENT_COMPLETED")
                .SumAsync(r => (decimal?)r.Amount) ?? 0;

            dto.OfficerWorkload = await _context.Users
                .AsNoTracking()
                .Where(u => u.IsActive && !u.IsDeleted && (u.Role.Key == "OFFICER" || u.Role.Key == "LOAN_OFFICER"))
                .Select(u => new OfficerWorkloadDto
                {
                    OfficerId = u.Id,
                    OfficerName = u.FullName,
                    AssignedApplications = _context.LoanApplications.Count(a => !a.IsDeleted && a.AssignedToUserId == u.Id),
                    ReviewedApplications = _context.LoanApplications.Count(a => !a.IsDeleted && a.AssignedToUserId == u.Id && a.Status.Key == "APPLICATION_REVIEWED")
                }).ToListAsync();
        }
        else if (roleKey == "MANAGER")
        {
            dto.TotalUsers = await _context.Users.CountAsync(u => u.IsActive && !u.IsDeleted);
            dto.TotalCustomers = await _context.Users.CountAsync(u => u.IsActive && !u.IsDeleted && u.Role.Key == "CUSTOMER");

            dto.TotalApplications = await applicationsQuery.CountAsync();
            dto.PendingApplications = await applicationsQuery.CountAsync(a =>
                a.Status.Key == "APPLICATION_SUBMITTED" ||
                a.Status.Key == "APPLICATION_UNDER_REVIEW" ||
                a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ApplicationsUnderReview = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_UNDER_REVIEW");
            dto.ApplicationsAwaitingDocuments = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ReviewedApplications = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_REVIEWED");
            dto.ApplicationsAwaitingApproval = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_REVIEWED");
            dto.ApprovedApplications = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_APPROVED");
            dto.RejectedApplications = await applicationsQuery.CountAsync(a => a.Status.Key == "APPLICATION_REJECTED");

            dto.TotalLoans = await loansQuery.CountAsync();
            dto.ActiveLoans = await loansQuery.CountAsync(l => l.Status.Key == "LOAN_ACTIVE");
            dto.ClosedLoans = await loansQuery.CountAsync(l => l.Status.Key == "LOAN_CLOSED");
            dto.TotalDisbursedAmount = await loansQuery.SumAsync(l => (decimal?)l.PrincipalAmount) ?? 0;
            dto.TotalOutstandingAmount = await loansQuery.SumAsync(l => (decimal?)l.OutstandingBalance) ?? 0;

            dto.TotalRepayments = await repaymentsQuery.CountAsync();
            dto.PendingRepayments = await repaymentsQuery.CountAsync(r => r.Status.Key == "REPAYMENT_PENDING");
            dto.TotalCollectedRepayments = await repaymentsQuery
                .Where(r => r.Status.Key == "REPAYMENT_COMPLETED")
                .SumAsync(r => (decimal?)r.Amount) ?? 0;

            dto.OfficerWorkload = await _context.Users
                .AsNoTracking()
                .Where(u => u.IsActive && !u.IsDeleted && (u.Role.Key == "OFFICER" || u.Role.Key == "LOAN_OFFICER"))
                .Select(u => new OfficerWorkloadDto
                {
                    OfficerId = u.Id,
                    OfficerName = u.FullName,
                    AssignedApplications = _context.LoanApplications.Count(a => !a.IsDeleted && a.AssignedToUserId == u.Id),
                    ReviewedApplications = _context.LoanApplications.Count(a => !a.IsDeleted && a.AssignedToUserId == u.Id && a.Status.Key == "APPLICATION_REVIEWED")
                }).ToListAsync();
        }
        else if (roleKey == "OFFICER" || roleKey == "LOAN_OFFICER")
        {
            var officerApps = applicationsQuery.Where(a => a.AssignedToUserId == userId);
            var officerAppIds = officerApps.Select(a => a.Id);

            dto.TotalApplications = await officerApps.CountAsync();
            dto.PendingApplications = await officerApps.CountAsync(a =>
                a.Status.Key == "APPLICATION_SUBMITTED" ||
                a.Status.Key == "APPLICATION_UNDER_REVIEW" ||
                a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ApplicationsUnderReview = await officerApps.CountAsync(a => a.Status.Key == "APPLICATION_UNDER_REVIEW");
            dto.ApplicationsAwaitingDocuments = await officerApps.CountAsync(a => a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ReviewedApplications = await officerApps.CountAsync(a => a.Status.Key == "APPLICATION_REVIEWED");
            dto.ApprovedApplications = await officerApps.CountAsync(a => a.Status.Key == "APPLICATION_APPROVED");
            dto.RejectedApplications = await officerApps.CountAsync(a => a.Status.Key == "APPLICATION_REJECTED");

            var officerLoans = loansQuery.Where(l => officerAppIds.Contains(l.LoanApplicationId));
            dto.TotalLoans = await officerLoans.CountAsync();
            dto.ActiveLoans = await officerLoans.CountAsync(l => l.Status.Key == "LOAN_ACTIVE");
            dto.ClosedLoans = await officerLoans.CountAsync(l => l.Status.Key == "LOAN_CLOSED");
            dto.TotalDisbursedAmount = await officerLoans.SumAsync(l => (decimal?)l.PrincipalAmount) ?? 0;
            dto.TotalOutstandingAmount = await officerLoans.SumAsync(l => (decimal?)l.OutstandingBalance) ?? 0;
        }
        else if (roleKey == "CUSTOMER")
        {
            var customerApps = applicationsQuery.Where(a => a.ApplicantUserId == userId);
            var customerLoans = loansQuery.Where(l => l.BorrowerUserId == userId);
            var customerRepayments = repaymentsQuery.Where(r => r.Loan.BorrowerUserId == userId);
            var customerSchedules = schedulesQuery.Where(s => s.Loan.BorrowerUserId == userId);

            dto.TotalApplications = await customerApps.CountAsync();
            dto.PendingApplications = await customerApps.CountAsync(a =>
                a.Status.Key == "APPLICATION_SUBMITTED" ||
                a.Status.Key == "APPLICATION_UNDER_REVIEW" ||
                a.Status.Key == "APPLICATION_DOCUMENTS_REQUIRED");
            dto.ApprovedApplications = await customerApps.CountAsync(a => a.Status.Key == "APPLICATION_APPROVED");
            dto.RejectedApplications = await customerApps.CountAsync(a => a.Status.Key == "APPLICATION_REJECTED");

            dto.TotalLoans = await customerLoans.CountAsync();
            dto.ActiveLoans = await customerLoans.CountAsync(l => l.Status.Key == "LOAN_ACTIVE");
            dto.ClosedLoans = await customerLoans.CountAsync(l => l.Status.Key == "LOAN_CLOSED");
            dto.TotalOutstandingAmount = await customerLoans.SumAsync(l => (decimal?)l.OutstandingBalance) ?? 0;

            dto.UpcomingInstallments = await customerSchedules.CountAsync(s =>
                s.Status.Key == "REPAYMENT_PENDING" && s.DueDate >= DateTime.UtcNow.Date);
            dto.PaidInstallments = await customerSchedules.CountAsync(s => s.Status.Key == "REPAYMENT_COMPLETED");
            dto.PendingRepayments = await customerRepayments.CountAsync(r => r.Status.Key == "REPAYMENT_PENDING");
            dto.TotalCollectedRepayments = await customerRepayments
                .Where(r => r.Status.Key == "REPAYMENT_COMPLETED")
                .SumAsync(r => (decimal?)r.Amount) ?? 0;
        }

        return dto;
    }
}
