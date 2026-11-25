using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class RepaymentScheduleRepository : IRepaymentScheduleRepository
{
    private readonly ApplicationDbContext _context;

    public RepaymentScheduleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Loan?> GetLoanByIdAsync(int loanId)
    {
        return await _context.Loans
            .Include(l => l.Status)
            .Include(l => l.LoanApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == loanId &&
                !x.IsDeleted);
    }

    public async Task<Status?> GetStatusByKeyAsync(
        string statusKey,
        string category)
    {
        return await _context.Statuses
            .FirstOrDefaultAsync(x =>
                x.Key == statusKey &&
                x.Category == category &&
                x.IsActive &&
                !x.IsDeleted);
    }

    public async Task<bool> ScheduleExistsAsync(int loanId)
    {
        return await _context.RepaymentSchedules
            .AnyAsync(x => x.LoanId == loanId && !x.IsDeleted);
    }

    public async Task<List<RepaymentSchedule>> GetByLoanIdAsync(int loanId)
    {
        var existing = await _context.RepaymentSchedules
            .AsNoTracking()
            .Include(x => x.Status)
            .Where(x => x.LoanId == loanId && !x.IsDeleted)
            .OrderBy(x => x.InstallmentNumber)
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
            .Include(x => x.Status)
            .Where(x => x.LoanId == loanId && !x.IsDeleted)
            .OrderBy(x => x.InstallmentNumber)
            .ToListAsync();
    }

    public async Task<User?> GetUserWithRoleAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);
    }

    public async Task<int> CreateSchedulesAsync(
        List<RepaymentSchedule> schedules)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.RepaymentSchedules.AddRangeAsync(schedules);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return schedules.Count;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
