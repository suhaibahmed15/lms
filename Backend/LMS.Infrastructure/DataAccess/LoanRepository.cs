using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class LoanRepository : ILoanRepository
{
    private readonly ApplicationDbContext _context;

    public LoanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Loan> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null,
        int? officerId = null)
    {
        var query = _context.Loans
            .AsNoTracking()
            .Include(l => l.Status)
            .Include(l => l.BorrowerUser)
            .Include(l => l.DisbursedByUser)
            .Include(l => l.LoanApplication)
                .ThenInclude(a => a.LoanType)
            .Where(l => !l.IsDeleted);

        if (customerId.HasValue)
        {
            query = query.Where(l => l.BorrowerUserId == customerId.Value);
        }

        if (officerId.HasValue)
        {
            query = query.Where(l => l.LoanApplication.AssignedToUserId == officerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(statusKey))
        {
            query = query.Where(l => l.Status.Key == statusKey.Trim());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(l =>
                l.LoanNumber.Contains(s) ||
                l.BorrowerUser.FullName.Contains(s) ||
                l.BorrowerUser.Email.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Loan?> GetByIdAsync(int loanId)
    {
        return await _context.Loans
            .AsNoTracking()
            .Include(l => l.Status)
            .Include(l => l.BorrowerUser)
            .Include(l => l.DisbursedByUser)
            .Include(l => l.LoanApplication)
                .ThenInclude(a => a.LoanType)
            .FirstOrDefaultAsync(l => l.Id == loanId && !l.IsDeleted);
    }

    public async Task<Loan?> GetByIdWithDetailsAsync(int loanId)
    {
        return await _context.Loans
            .AsNoTracking()
            .Include(l => l.Status)
            .Include(l => l.BorrowerUser)
            .Include(l => l.DisbursedByUser)
            .Include(l => l.LoanApplication)
                .ThenInclude(a => a.LoanType)
            .Include(l => l.RepaymentSchedules)
                .ThenInclude(rs => rs.Status)
            .Include(l => l.Repayments)
                .ThenInclude(r => r.Status)
            .FirstOrDefaultAsync(l => l.Id == loanId && !l.IsDeleted);
    }

    public async Task<List<RepaymentSchedule>> GetRepaymentScheduleAsync(int loanId)
    {
        var existing = await _context.RepaymentSchedules
            .AsNoTracking()
            .Include(rs => rs.Status)
            .Where(rs => rs.LoanId == loanId && !rs.IsDeleted)
            .OrderBy(rs => rs.InstallmentNumber)
            .ToListAsync();

        if (existing.Count > 0)
            return existing;

        var loan = await _context.Loans.FirstOrDefaultAsync(l => l.Id == loanId && !l.IsDeleted);
        if (loan == null || loan.TermMonths <= 0 || loan.TotalPayableAmount <= 0)
            return existing;

        var pendingStatus = await _context.Statuses
            .FirstOrDefaultAsync(s => s.Key == "REPAYMENT_PENDING" && s.Category == "Repayment" && !s.IsDeleted);

        if (pendingStatus == null)
            return existing;

        var totalInterest = loan.TotalPayableAmount - loan.PrincipalAmount;
        var monthlyPrincipal = decimal.Round(loan.PrincipalAmount / loan.TermMonths, 2, MidpointRounding.AwayFromZero);
        var monthlyInterest = decimal.Round(totalInterest / loan.TermMonths, 2, MidpointRounding.AwayFromZero);
        var monthlyTotal = monthlyPrincipal + monthlyInterest;

        var startDate = loan.DisbursedAt.HasValue
            ? loan.DisbursedAt.Value.AddMonths(1)
            : DateTime.UtcNow.AddMonths(1);

        var newSchedules = new List<RepaymentSchedule>();
        for (var i = 1; i <= loan.TermMonths; i++)
        {
            var dueDate = startDate.AddMonths(i - 1);
            newSchedules.Add(new RepaymentSchedule
            {
                LoanId = loanId,
                InstallmentNumber = i,
                DueDate = dueDate,
                PrincipalDue = monthlyPrincipal,
                InterestDue = monthlyInterest,
                TotalDue = monthlyTotal,
                PaidAmount = 0m,
                StatusId = pendingStatus.Id,
                CreatedBy = loan.DisbursedByUserId ?? loan.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            });
        }

        await _context.RepaymentSchedules.AddRangeAsync(newSchedules);
        await _context.SaveChangesAsync();

        return await _context.RepaymentSchedules
            .AsNoTracking()
            .Include(rs => rs.Status)
            .Where(rs => rs.LoanId == loanId && !rs.IsDeleted)
            .OrderBy(rs => rs.InstallmentNumber)
            .ToListAsync();
    }

    public async Task<List<Repayment>> GetRepaymentHistoryAsync(int loanId)
    {
        return await _context.Repayments
            .AsNoTracking()
            .Include(r => r.Status)
            .Where(r => r.LoanId == loanId && !r.IsDeleted)
            .OrderByDescending(r => r.PaidAt)
            .ToListAsync();
    }

    public async Task<User?> GetUserWithRoleAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);
    }
}
