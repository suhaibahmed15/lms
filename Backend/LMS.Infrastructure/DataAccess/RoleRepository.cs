
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get all roles that are not deleted.
    public async Task<List<Role>> GetAllAsync()
    {
        return await _context.Roles
            .AsNoTracking()
            .Where(r => !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    // Get role by ID.
    public async Task<Role?> GetByIdAsync(int id)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }

    // Check whether role name already exists.
    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _context.Roles
            .AnyAsync(r => r.Name == name && !r.IsDeleted);
    }

    // Check whether role key already exists.
    public async Task<bool> ExistsByKeyAsync(string key)
    {
        return await _context.Roles
            .AnyAsync(r => r.Key == key && !r.IsDeleted);
    }

    // Check duplicate name excluding current role.
    public async Task<bool> ExistsByNameAsync(string name, int excludeId)
    {
        return await _context.Roles
            .AnyAsync(r =>
                r.Name == name &&
                r.Id != excludeId &&
                !r.IsDeleted);
    }

    // Check duplicate key excluding current role.
    public async Task<bool> ExistsByKeyAsync(string key, int excludeId)
    {
        return await _context.Roles
            .AnyAsync(r =>
                r.Key == key &&
                r.Id != excludeId &&
                !r.IsDeleted);
    }

    // Add new role.
    public async Task AddAsync(Role role)
    {
        await _context.Roles.AddAsync(role);
    }

    // Update existing role.
    public Task UpdateAsync(Role role)
    {
        _context.Roles.Update(role);
        return Task.CompletedTask;
    }

    // Check whether role is assigned to users.
    public async Task<bool> HasAssignedUsersAsync(int roleId)
    {
        return await _context.Users
            .AnyAsync(u => u.RoleId == roleId && !u.IsDeleted);
    }

    // Check whether role has assigned permissions.
    public async Task<bool> HasAssignedPermissionsAsync(int roleId)
    {
        return await _context.RolePermissions
            .AnyAsync(rp => rp.RoleId == roleId);
    }

    // Check whether role has assigned menus.
    public async Task<bool> HasAssignedMenusAsync(int roleId)
    {
        return await _context.RoleMenus
            .AnyAsync(rm => rm.RoleId == roleId);
    }

    // Save database changes.
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
