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
            .AnyAsync(x => x.LoanId == loanId);
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