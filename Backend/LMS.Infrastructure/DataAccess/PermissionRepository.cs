
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
            .OrderBy(p => p.Name)
            .ToListAsync();
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
        // Check user and get role
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive);

        if (user == null)
            throw new InvalidOperationException("User not found or inactive.");

        // Admin gets all active permissions
        if (user.Role.Key == "ADMIN")
        {
            return await _context.Permissions
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        // Get role permissions
        var rolePermissions = _context.RolePermissions
            .Where(rp => rp.RoleId == user.RoleId)
            .Select(rp => rp.PermissionId);

        // Get individual active user permissions
        var userPermissions = _context.UserPermissions
            .Where(up =>
                up.UserId == userId &&
                up.IsActive)
            .Select(up => up.PermissionId);

        // Combine both permission sources
        var permissionIds = rolePermissions
            .Union(userPermissions);

        return await _context.Permissions
            .AsNoTracking()
            .Where(p =>
                permissionIds.Contains(p.Id) &&
                p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }
}
