using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class RolePermissionRepository : IRolePermissionRepository
{
    private readonly ApplicationDbContext _context;

    public RolePermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> RoleExistsAsync(int roleId)
    {
        return await _context.Roles
            .AnyAsync(r => r.Id == roleId && r.IsActive && !r.IsDeleted);
    }

    public async Task<bool> PermissionExistsAsync(int permissionId)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Id == permissionId && p.IsActive && !p.IsDeleted);
    }

    public async Task<bool> AssignmentExistsAsync(int roleId, int permissionId)
    {
        return await _context.RolePermissions
            .AnyAsync(rp =>
                rp.RoleId == roleId &&
                rp.PermissionId == permissionId &&
                !rp.IsDeleted);
    }

    public async Task<RolePermission?> GetExistingAssignmentAsync(int roleId, int permissionId)
    {
        return await _context.RolePermissions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(rp =>
                rp.RoleId == roleId &&
                rp.PermissionId == permissionId);
    }

    public async Task<List<RolePermission>> GetAllAsync()
    {
        return await _context.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => !rp.IsDeleted && rp.Permission.IsActive && !rp.Permission.IsDeleted && !rp.Permission.Key.StartsWith("AUDIT_LOG"))
            .OrderBy(rp => rp.RoleId)
            .ThenBy(rp => rp.Permission.Name)
            .ToListAsync();
    }

    public async Task<(List<RolePermission> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? roleId,
        int? permissionId,
        bool? isActive)
    {
        var query = _context.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => !rp.IsDeleted && !rp.Permission.IsDeleted && !rp.Permission.Key.StartsWith("AUDIT_LOG"));

        if (roleId.HasValue)
        {
            query = query.Where(rp => rp.RoleId == roleId.Value);
        }

        if (permissionId.HasValue)
        {
            query = query.Where(rp => rp.PermissionId == permissionId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(rp => rp.Permission.IsActive == isActive.Value);
        }
        else
        {
            query = query.Where(rp => rp.Permission.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(rp =>
                rp.Permission.Name.ToLower().Contains(term) ||
                rp.Permission.Key.ToLower().Contains(term));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "permissionname" => isDesc ? query.OrderByDescending(rp => rp.Permission.Name) : query.OrderBy(rp => rp.Permission.Name),
            "permissionkey" => isDesc ? query.OrderByDescending(rp => rp.Permission.Key) : query.OrderBy(rp => rp.Permission.Key),
            "createdat" => isDesc ? query.OrderByDescending(rp => rp.CreatedAt) : query.OrderBy(rp => rp.CreatedAt),
            _ => isDesc ? query.OrderByDescending(rp => rp.RoleId).ThenByDescending(rp => rp.Permission.Name) : query.OrderBy(rp => rp.RoleId).ThenBy(rp => rp.Permission.Name)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<List<RolePermission>> GetByRoleIdAsync(int roleId)
    {
        return await _context.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == roleId && !rp.IsDeleted && rp.Permission.IsActive && !rp.Permission.IsDeleted && !rp.Permission.Key.StartsWith("AUDIT_LOG"))
            .OrderBy(rp => rp.Permission.Name)
            .ToListAsync();
    }

    public async Task<RolePermission?> GetByIdAsync(int id)
    {
        return await _context.RolePermissions
            .FirstOrDefaultAsync(rp => rp.Id == id);
    }

    public async Task AddAsync(RolePermission rolePermission)
    {
        await _context.RolePermissions.AddAsync(rolePermission);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}