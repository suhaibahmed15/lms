
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class PermissionRepository : IPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public PermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Permission>> GetAllAsync()
    {
        return await _context.Permissions
            .AsNoTracking()
            .Where(p => !p.IsDeleted && !p.Key.StartsWith("AUDIT_LOG"))
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<(List<Permission> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive,
        int? menuId)
    {
        var query = _context.Permissions
            .AsNoTracking()
            .Where(p => !p.IsDeleted && !p.Key.StartsWith("AUDIT_LOG"));

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        if (menuId.HasValue)
        {
            query = query.Where(p => p.MenuId == menuId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                p.Key.ToLower().Contains(term) ||
                (p.Description != null && p.Description.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "key" => isDesc ? query.OrderByDescending(p => p.Key) : query.OrderBy(p => p.Key),
            "isactive" or "status" => isDesc ? query.OrderByDescending(p => p.IsActive) : query.OrderBy(p => p.IsActive),
            "createdat" => isDesc ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            "id" => isDesc ? query.OrderByDescending(p => p.Id) : query.OrderBy(p => p.Id),
            _ => isDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<Permission?> GetByIdAsync(int id)
    {
        return await _context.Permissions
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<bool> KeyExistsAsync(string key, int? excludeId = null)
    {
        return await _context.Permissions.AnyAsync(p =>
            p.Key == key &&
            (!excludeId.HasValue || p.Id != excludeId.Value));
    }

    public async Task AddAsync(Permission permission)
    {
        await _context.Permissions.AddAsync(permission);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }


    public async Task<List<Permission>> GetPermissionsByUserIdAsync(int userId)
    {
        // Check active user and active role
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted &&
                u.Role.IsActive &&
                !u.Role.IsDeleted);

        if (user == null)
            throw new InvalidOperationException("User not found or inactive.");

        // Admin gets all active non-deleted permissions (excluding database-only Audit Log permissions)
        if (user.Role.Key.Equals("ADMIN", StringComparison.OrdinalIgnoreCase))
        {
            return await _context.Permissions
                .AsNoTracking()
                .Where(p => p.IsActive && !p.IsDeleted && !p.Key.StartsWith("AUDIT_LOG"))
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        // Get active, non-revoked individual user permission IDs
        var activeUserPermissionIds = await _context.UserPermissions
            .AsNoTracking()
            .Where(up =>
                up.UserId == userId &&
                up.IsActive &&
                !up.IsDeleted &&
                up.RevokedAt == null &&
                up.Permission.IsActive &&
                !up.Permission.IsDeleted)
            .Select(up => up.PermissionId)
            .Distinct()
            .ToListAsync();

        // Get explicitly revoked individual permissions not currently re-granted
        var revokedPermissionIds = await _context.UserPermissions
            .AsNoTracking()
            .Where(up =>
                up.UserId == userId &&
                (!up.IsActive || up.RevokedAt != null) &&
                !up.IsDeleted &&
                !activeUserPermissionIds.Contains(up.PermissionId))
            .Select(up => up.PermissionId)
            .Distinct()
            .ToListAsync();

        // Get active role permissions excluding explicitly revoked permissions
        var rolePermissionIds = await _context.RolePermissions
            .AsNoTracking()
            .Where(rp =>
                rp.RoleId == user.RoleId &&
                !rp.IsDeleted &&
                !revokedPermissionIds.Contains(rp.PermissionId) &&
                rp.Permission.IsActive &&
                !rp.Permission.IsDeleted)
            .Select(rp => rp.PermissionId)
            .Distinct()
            .ToListAsync();

        // Active UserMenus grant default VIEW-ONLY (*_VIEW) permissions for their assigned menus
        var activeUserMenuIds = await _context.UserMenus
            .AsNoTracking()
            .Where(um =>
                um.UserId == userId &&
                um.IsActive &&
                !um.IsDeleted &&
                um.Menu.IsActive &&
                !um.Menu.IsDeleted)
            .Select(um => um.MenuId)
            .Distinct()
            .ToListAsync();

        var menuViewPermissionIds = activeUserMenuIds.Count == 0
            ? new List<int>()
            : await _context.Permissions
                .AsNoTracking()
                .Where(p =>
                    p.MenuId.HasValue &&
                    activeUserMenuIds.Contains(p.MenuId.Value) &&
                    p.Key.EndsWith("_VIEW") &&
                    p.IsActive &&
                    !p.IsDeleted)
                .Select(p => p.Id)
                .Distinct()
                .ToListAsync();

        var effectivePermissionIds = rolePermissionIds
            .Union(activeUserPermissionIds)
            .Union(menuViewPermissionIds)
            .Distinct()
            .ToList();

        return await _context.Permissions
            .AsNoTracking()
            .Where(p =>
                effectivePermissionIds.Contains(p.Id) &&
                p.IsActive &&
                !p.IsDeleted &&
                !p.Key.StartsWith("AUDIT_LOG"))
            .OrderBy(p => p.Name)
            .ToListAsync();
    }
}
