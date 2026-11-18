
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get all users.
    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.Id)
            .ToListAsync();
    }

    public async Task<(List<User> Items, int TotalRecords, int ActiveCount, int InactiveCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? roleId,
        bool? isActive)
    {
        var baseQuery = _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => !u.IsDeleted);

        var activeCount = await baseQuery.CountAsync(u => u.IsActive);
        var inactiveCount = await baseQuery.CountAsync(u => !u.IsActive);

        var query = baseQuery;

        if (roleId.HasValue)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term) ||
                (u.PhoneNumber != null && u.PhoneNumber.ToLower().Contains(term)) ||
                u.Role.Name.ToLower().Contains(term));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "fullname" => isDesc ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName),
            "email" => isDesc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "phonenumber" => isDesc ? query.OrderByDescending(u => u.PhoneNumber) : query.OrderBy(u => u.PhoneNumber),
            "role" or "rolename" or "roleid" => isDesc ? query.OrderByDescending(u => u.Role.Name) : query.OrderBy(u => u.Role.Name),
            "isactive" or "status" => isDesc ? query.OrderByDescending(u => u.IsActive) : query.OrderBy(u => u.IsActive),
            "createdat" => isDesc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => isDesc ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords, activeCount, inactiveCount);
    }

    // Get user by ID.
    // Keep the entity tracked for updates.
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
    }

    // Check whether email already exists.
    public async Task<bool> ExistsByEmailAsync(
        string email,
        int? excludeUserId = null)
    {
        return await _context.Users.AnyAsync(u =>
            !u.IsDeleted &&
            u.Email == email &&
            (excludeUserId == null || u.Id != excludeUserId.Value));
    }

    // Check whether the selected role exists and is active.
    public async Task<bool> RoleExistsAsync(int roleId)
    {
        return await _context.Roles.AnyAsync(r =>
            r.Id == roleId &&
            r.IsActive &&
            !r.IsDeleted);
    }

    // Add a new user.
    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    // Update an existing user.
    public Task UpdateAsync(User user)
    {
        _context.Users.Update(user);

        return Task.CompletedTask;
    }

    // Save database changes.
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
