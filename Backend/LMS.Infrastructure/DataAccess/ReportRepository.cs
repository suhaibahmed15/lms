using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class ReportRepository : IReportRepository
{
    private readonly ApplicationDbContext _context;

    public ReportRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Loan>> GetLoansReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null)
    {
        var query = _context.Loans
            .AsNoTracking()
            .Include(l => l.Status)
            .Include(l => l.BorrowerUser)
            .Include(l => l.LoanApplication)
                .ThenInclude(a => a.LoanType)
            .Where(l => !l.IsDeleted);

        if (customerId.HasValue)
            query = query.Where(l => l.BorrowerUserId == customerId.Value);

        if (!string.IsNullOrWhiteSpace(statusKey))
            query = query.Where(l => l.Status.Key == statusKey.Trim());

        if (fromDate.HasValue)
            query = query.Where(l => l.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(l => l.CreatedAt <= toDate.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(l =>
                l.LoanNumber.Contains(s) ||
                l.BorrowerUser.FullName.Contains(s) ||
                l.BorrowerUser.Email.Contains(s));
        }

        return await query.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    public async Task<Loan?> GetLoanForStatementAsync(int loanId)
    {
        return await _context.Loans
            .AsNoTracking()
            .Include(l => l.Status)
            .Include(l => l.BorrowerUser)
            .Include(l => l.LoanApplication)
                .ThenInclude(a => a.LoanType)
            .Include(l => l.RepaymentSchedules)
                .ThenInclude(s => s.Status)
            .Include(l => l.Repayments)
                .ThenInclude(r => r.Status)
            .FirstOrDefaultAsync(l => l.Id == loanId && !l.IsDeleted);
    }

    public async Task<List<Repayment>> GetRepaymentsReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null)
    {
        var query = _context.Repayments
            .AsNoTracking()
            .Include(r => r.Status)
            .Include(r => r.Loan)
                .ThenInclude(l => l.BorrowerUser)
            .Where(r => !r.IsDeleted);

        if (customerId.HasValue)
            query = query.Where(r => r.Loan.BorrowerUserId == customerId.Value);

        if (!string.IsNullOrWhiteSpace(statusKey))
            query = query.Where(r => r.Status.Key == statusKey.Trim());

        if (fromDate.HasValue)
            query = query.Where(r => r.PaidAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(r => r.PaidAt <= toDate.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(r =>
                r.PaymentReference.Contains(s) ||
                r.Loan.LoanNumber.Contains(s) ||
                r.Loan.BorrowerUser.FullName.Contains(s));
        }

        return await query.OrderByDescending(r => r.PaidAt).ToListAsync();
    }

    public async Task<List<RepaymentSchedule>> GetInstallmentsReportAsync(
        bool overdueOnly,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        var now = DateTime.UtcNow.Date;

        var query = _context.RepaymentSchedules
            .AsNoTracking()
            .Include(s => s.Status)
            .Include(s => s.Loan)
                .ThenInclude(l => l.BorrowerUser)
            .Where(s => !s.IsDeleted && s.Status.Key == "REPAYMENT_PENDING");

        if (overdueOnly)
        {
            query = query.Where(s => s.DueDate < now);
        }

        if (customerId.HasValue)
            query = query.Where(s => s.Loan.BorrowerUserId == customerId.Value);

        if (fromDate.HasValue)
            query = query.Where(s => s.DueDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(s => s.DueDate <= toDate.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(item =>
                item.Loan.LoanNumber.Contains(term) ||
                item.Loan.BorrowerUser.FullName.Contains(term));
        }

        return await query.OrderBy(s => s.DueDate).ToListAsync();
    }

    public async Task<List<Loan>> GetDisbursementsReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        var query = _context.Loans
            .AsNoTracking()
            .Include(l => l.BorrowerUser)
            .Include(l => l.DisbursedByUser)
            .Include(l => l.LoanApplication)
                .ThenInclude(a => a.LoanType)
            .Where(l => !l.IsDeleted && l.DisbursedAt != null);

        if (customerId.HasValue)
            query = query.Where(l => l.BorrowerUserId == customerId.Value);

        if (fromDate.HasValue)
            query = query.Where(l => l.DisbursedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(l => l.DisbursedAt <= toDate.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(l =>
                l.LoanNumber.Contains(s) ||
                l.BorrowerUser.FullName.Contains(s));
        }

        return await query.OrderByDescending(l => l.DisbursedAt).ToListAsync();
    }

    public async Task<User?> GetUserWithRoleAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);
    }
}
