
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class UserPermissionRepository : IUserPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public UserPermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> UserExistsAsync(int userId)
    {
        return await _context.Users
            .AnyAsync(u => u.Id == userId && u.IsActive && !u.IsDeleted);
    }

    public async Task<bool> PermissionExistsAsync(int permissionId)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Id == permissionId && !p.IsDeleted);
    }

    public async Task<bool> PermissionIsActiveAsync(int permissionId)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Id == permissionId && p.IsActive && !p.IsDeleted);
    }

    public async Task<bool> AssignmentExistsAsync(int userId, int permissionId)
    {
        return await _context.UserPermissions
            .AnyAsync(x =>
                x.UserId == userId &&
                x.PermissionId == permissionId &&
                x.IsActive &&
                !x.IsDeleted &&
                x.RevokedAt == null);
    }

    public async Task<List<UserPermission>> GetRevokedAssignmentsAsync(int userId, int permissionId)
    {
        return await _context.UserPermissions
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Where(x =>
                x.UserId == userId &&
                x.PermissionId == permissionId &&
                (!x.IsActive || x.RevokedAt != null) &&
                !x.IsDeleted)
            .OrderByDescending(x => x.Id)
            .ToListAsync();
    }

    public async Task<List<UserPermission>> GetAllAsync()
    {
        return await _context.UserPermissions
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.Id)
            .ToListAsync();
    }

    public async Task<(List<UserPermission> Items, int TotalRecords, int ActiveCount, int RevokedCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? userId,
        int? permissionId,
        bool? isActive)
    {
        var baseQuery = _context.UserPermissions
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .Where(x => !x.IsDeleted);

        var activeCount = await baseQuery.CountAsync(x => x.IsActive && x.RevokedAt == null);
        var revokedCount = await baseQuery.CountAsync(x => !x.IsActive || x.RevokedAt != null);

        var query = baseQuery;

        if (userId.HasValue)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        if (permissionId.HasValue)
        {
            query = query.Where(x => x.PermissionId == permissionId.Value);
        }

        if (isActive.HasValue)
        {
            query = isActive.Value
                ? query.Where(x => x.IsActive && x.RevokedAt == null)
                : query.Where(x => !x.IsActive || x.RevokedAt != null);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.User.FullName.ToLower().Contains(term) ||
                x.User.Email.ToLower().Contains(term) ||
                x.Permission.Name.ToLower().Contains(term) ||
                x.Permission.Key.ToLower().Contains(term));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "username" or "fullname" => isDesc ? query.OrderByDescending(x => x.User.FullName) : query.OrderBy(x => x.User.FullName),
            "permissionname" or "permission" => isDesc ? query.OrderByDescending(x => x.Permission.Name) : query.OrderBy(x => x.Permission.Name),
            "assignedat" => isDesc ? query.OrderByDescending(x => x.AssignedAt) : query.OrderBy(x => x.AssignedAt),
            "isactive" or "status" => isDesc ? query.OrderByDescending(x => x.IsActive) : query.OrderBy(x => x.IsActive),
            "createdat" => isDesc ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            _ => isDesc ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords, activeCount, revokedCount);
    }

    public async Task<List<UserPermission>> GetByUserIdAsync(int userId, bool activeOnly = true)
    {
        var query = _context.UserPermissions
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .Where(x => x.UserId == userId && !x.IsDeleted);

        if (activeOnly)
        {
            query = query.Where(x =>
                x.IsActive &&
                x.RevokedAt == null &&
                x.Permission.IsActive &&
                !x.Permission.IsDeleted);
        }

        return await query
            .OrderByDescending(x => x.Id)
            .ToListAsync();
    }

    public async Task<UserPermission?> GetByIdAsync(int id)
    {
        return await _context.UserPermissions
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(UserPermission userPermission)
    {
        await _context.UserPermissions.AddAsync(userPermission);
    }

    public void Update(UserPermission userPermission)
    {
        _context.UserPermissions.Update(userPermission);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
