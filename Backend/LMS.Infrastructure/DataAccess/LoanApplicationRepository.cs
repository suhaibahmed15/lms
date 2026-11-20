
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

    // Get active user by ID with role
    public async Task<User?> GetUserByIdAsync(int userId)
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

    // Get active Application Status by Key
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
            .Where(a => !a.IsDeleted)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    // Get paginated loan applications according to user role
    public async Task<(List<LoanApplication> Items, int TotalRecords)> GetPagedForUserAsync(
        int userId,
        string roleKey,
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? statusId,
        int? loanTypeId)
    {
        var query = _context.LoanApplications
            .AsNoTracking()
            .Include(a => a.ApplicantUser)
            .Include(a => a.LoanType)
            .Include(a => a.Status)
            .Include(a => a.AssignedToUser)
            .Where(a => !a.IsDeleted);

        // ADMIN can view all applications
        if (roleKey.Equals("ADMIN", StringComparison.OrdinalIgnoreCase))
        {
            // No additional filter required
        }

        // MANAGER can view all applications to assign or reassign officers
        else if (roleKey.Equals("MANAGER", StringComparison.OrdinalIgnoreCase))
        {
            // No additional filter required
        }

        // OFFICER can view only currently assigned applications
        else if (roleKey.Equals("OFFICER", StringComparison.OrdinalIgnoreCase) ||
                 roleKey.Equals("LOAN_OFFICER", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.AssignedToUserId == userId);
        }

        // CUSTOMER can view only their own applications
        else if (roleKey.Equals("CUSTOMER", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(a => a.ApplicantUserId == userId);
        }
        else
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to view loan applications.");
        }

        // Filter by application status
        if (statusId.HasValue)
        {
            query = query.Where(a => a.StatusId == statusId.Value);
        }

        // Filter by loan type
        if (loanTypeId.HasValue)
        {
            query = query.Where(a => a.LoanTypeId == loanTypeId.Value);
        }

        // Search applications
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();

            query = query.Where(a =>
                a.ApplicationNumber.ToLower().Contains(term) ||
                a.ApplicantUser.FullName.ToLower().Contains(term) ||
                a.LoanType.Name.ToLower().Contains(term) ||
                a.Status.Name.ToLower().Contains(term) ||
                (a.Purpose != null && a.Purpose.ToLower().Contains(term)));
        }

        // Get total records before pagination
        var totalRecords = await query.CountAsync();

        // Sorting
        var isDesc = string.Equals(
            sortDirection,
            "desc",
            StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "applicationnumber" => isDesc
                ? query.OrderByDescending(a => a.ApplicationNumber)
                : query.OrderBy(a => a.ApplicationNumber),

            "requestedamount" => isDesc
                ? query.OrderByDescending(a => a.RequestedAmount)
                : query.OrderBy(a => a.RequestedAmount),

            "submittedat" => isDesc
                ? query.OrderByDescending(a => a.SubmittedAt)
                : query.OrderBy(a => a.SubmittedAt),

            "status" => isDesc
                ? query.OrderByDescending(a => a.Status.Name)
                : query.OrderBy(a => a.Status.Name),

            "id" => isDesc
                ? query.OrderByDescending(a => a.Id)
                : query.OrderBy(a => a.Id),

            _ => isDesc
                ? query.OrderByDescending(a => a.CreatedAt)
                : query.OrderBy(a => a.CreatedAt)
        };

        // Pagination
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    // Get a single application with related data
    // Tracking is enabled because assignment and approval workflows may update it
    public async Task<LoanApplication?> GetApplicationByIdAsync(int applicationId)
    {
        return await _context.LoanApplications
            .Include(a => a.ApplicantUser)
            .Include(a => a.LoanType)
            .Include(a => a.Status)
            .Include(a => a.AssignedToUser)
            .Include(a => a.Assignments)
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                !a.IsDeleted);
    }
}
