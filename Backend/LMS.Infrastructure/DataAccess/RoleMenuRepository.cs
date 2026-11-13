using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class RoleMenuRepository : IRoleMenuRepository
{
    private readonly ApplicationDbContext _context;

    public RoleMenuRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> RoleExistsAsync(int roleId)
    {
        return await _context.Roles
            .AnyAsync(r => r.Id == roleId);
    }

    public async Task<bool> MenuExistsAsync(int menuId)
    {
        return await _context.Menus
            .AnyAsync(m => m.Id == menuId);
    }

    public async Task<bool> AssignmentExistsAsync(int roleId, int menuId)
    {
        return await _context.RoleMenus
            .AnyAsync(rm =>
                rm.RoleId == roleId &&
                rm.MenuId == menuId);
    }

    // Get all role-menu assignments
    public async Task<List<RoleMenu>> GetAllAsync()
    {
        return await _context.RoleMenus
            .AsNoTracking()
            .Include(rm => rm.Menu)
            .OrderBy(rm => rm.RoleId)
            .ThenBy(rm => rm.Menu.DisplayOrder)
            .ToListAsync();
    }

    // Get active menus assigned to a particular role
    public async Task<List<RoleMenu>> GetMenusByRoleIdAsync(int roleId)
    {
        return await _context.RoleMenus
            .AsNoTracking()
            .Include(rm => rm.Menu)
            .Where(rm =>
                rm.RoleId == roleId &&
                rm.Menu.IsActive)
            .OrderBy(rm => rm.Menu.DisplayOrder)
            .ToListAsync();
    }

    // Get assignment by its ID
    public async Task<RoleMenu?> GetByIdAsync(int id)
    {
        return await _context.RoleMenus
            .FirstOrDefaultAsync(rm => rm.Id == id);
    }

    public async Task AddAsync(RoleMenu roleMenu)
    {
        await _context.RoleMenus.AddAsync(roleMenu);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}