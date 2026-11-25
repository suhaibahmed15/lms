using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace LMS.Infrastructure.DataAccess;

public class RepaymentRepository : IRepaymentRepository
{
    private IDbContextTransaction? _transaction;
    private readonly ApplicationDbContext _context;

    public RepaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x =>
                x.Id == userId &&
                x.IsActive &&
                !x.IsDeleted &&
                x.Role != null &&
                x.Role.IsActive &&
                !x.Role.IsDeleted);
    }

    public async Task<User?> GetUserWithRoleAsync(int userId)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);
    }

    public async Task<RepaymentSchedule?> GetScheduleForCustomerAsync(
        int scheduleId,
        int customerId)
    {
        return await _context.RepaymentSchedules
            .Include(x => x.Status)
            .Include(x => x.Loan)
                .ThenInclude(x => x.Status)
            .Include(x => x.Repayments)
                .ThenInclude(x => x.Status)
            .FirstOrDefaultAsync(x =>
                x.Id == scheduleId &&
                x.Loan.BorrowerUserId == customerId &&
                !x.IsDeleted &&
                !x.Loan.IsDeleted);
    }

    public async Task<RepaymentSchedule?> GetScheduleByIdAsync(int scheduleId)
    {
        return await _context.RepaymentSchedules
            .Include(x => x.Status)
            .Include(x => x.Loan)
                .ThenInclude(x => x.Status)
            .Include(x => x.Repayments)
                .ThenInclude(x => x.Status)
            .FirstOrDefaultAsync(x =>
                x.Id == scheduleId &&
                !x.IsDeleted &&
                !x.Loan.IsDeleted);
    }

    public async Task<bool> PaymentReferenceExistsAsync(string reference)
    {
        return await _context.Repayments
            .AnyAsync(x => x.PaymentReference == reference);
    }

    public async Task<bool> HasPendingPaymentAsync(int scheduleId)
    {
        return await _context.Repayments
            .AnyAsync(x =>
                x.RepaymentScheduleId == scheduleId &&
                x.Status.Key == "REPAYMENT_PENDING");
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

    public async Task<Status?> GetLoanStatusByKeyAsync(string statusKey)
    {
        return await _context.Statuses
            .FirstOrDefaultAsync(x =>
                x.Key == statusKey &&
                x.Category == "Loan" &&
                x.IsActive &&
                !x.IsDeleted);
    }

    public async Task<int> CreateAsync(Repayment repayment)
    {
        await _context.Repayments.AddAsync(repayment);
        await _context.SaveChangesAsync();

        return repayment.Id;
    }

    public async Task<List<Repayment>> GetPendingPaymentsAsync()
    {
        return await _context.Repayments
            .Include(x => x.Status)
            .Include(x => x.Loan)
                .ThenInclude(x => x.BorrowerUser)
            .Include(x => x.RepaymentSchedule)
            .Where(x => x.Status.Key == "REPAYMENT_PENDING")
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<(List<Repayment> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null,
        int? loanId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.Repayments
            .AsNoTracking()
            .Include(x => x.Status)
            .Include(x => x.Loan)
                .ThenInclude(x => x.BorrowerUser)
            .Include(x => x.RepaymentSchedule)
            .Where(x => !x.IsDeleted);

        if (customerId.HasValue)
        {
            query = query.Where(x => x.Loan.BorrowerUserId == customerId.Value);
        }

        if (loanId.HasValue)
        {
            query = query.Where(x => x.LoanId == loanId.Value);
        }

        if (!string.IsNullOrWhiteSpace(statusKey))
        {
            query = query.Where(x => x.Status.Key == statusKey.Trim());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(x =>
                x.PaymentReference.Contains(s) ||
                (x.Remarks != null && x.Remarks.Contains(s)) ||
                x.Loan.BorrowerUser.FullName.Contains(s) ||
                x.Loan.LoanNumber.Contains(s));
        }

        if (fromDate.HasValue)
        {
            query = query.Where(x => x.PaidAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(x => x.PaidAt <= toDate.Value);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.PaidAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Repayment?> GetPaymentByIdAsync(int repaymentId)
    {
        return await _context.Repayments
            .Include(x => x.Status)
            .Include(x => x.Loan)
                .ThenInclude(x => x.Status)
            .Include(x => x.Loan)
                .ThenInclude(x => x.BorrowerUser)
            .Include(x => x.RepaymentSchedule)
                .ThenInclude(x => x!.Repayments)
                    .ThenInclude(x => x.Status)
            .FirstOrDefaultAsync(x => x.Id == repaymentId);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        if (_transaction != null)
            throw new InvalidOperationException(
                "A transaction is already in progress.");

        _transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable);
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction == null)
            throw new InvalidOperationException(
                "No active transaction found.");

        await _transaction.CommitAsync();
        await _transaction.DisposeAsync();

        _transaction = null;
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction == null)
            return;

        await _transaction.RollbackAsync();
        await _transaction.DisposeAsync();

        _transaction = null;
    }
}
