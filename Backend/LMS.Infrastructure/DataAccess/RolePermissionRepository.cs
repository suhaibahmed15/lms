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
            .AnyAsync(r => r.Id == roleId);
    }

    public async Task<bool> PermissionExistsAsync(int permissionId)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Id == permissionId);
    }

    public async Task<bool> AssignmentExistsAsync(int roleId, int permissionId)
    {
        return await _context.RolePermissions
            .AnyAsync(rp =>
                rp.RoleId == roleId &&
                rp.PermissionId == permissionId);
    }

    public async Task<List<RolePermission>> GetAllAsync()
    {
        return await _context.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .OrderBy(rp => rp.RoleId)
            .ThenBy(rp => rp.Permission.Name)
            .ToListAsync();
    }

    public async Task<List<RolePermission>> GetByRoleIdAsync(int roleId)
    {
        return await _context.RolePermissions
            .AsNoTracking()
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == roleId)
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