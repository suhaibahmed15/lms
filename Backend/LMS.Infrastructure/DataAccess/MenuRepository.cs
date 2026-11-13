using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class MenuRepository : IMenuRepository
{
    private readonly ApplicationDbContext _context;

    public MenuRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Menu>> GetAllAsync()
    {
        return await _context.Menus
            .AsNoTracking()
            .Include(m => m.ParentMenu)
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();
    }

    public async Task<Menu?> GetByIdAsync(int id)
    {
        return await _context.Menus
            .Include(m => m.ParentMenu)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<bool> KeyExistsAsync(
        string key,
        int? excludeId = null)
    {
        return await _context.Menus.AnyAsync(m =>
            m.Key == key &&
            (!excludeId.HasValue || m.Id != excludeId.Value));
    }

    public async Task<bool> ParentExistsAsync(int parentMenuId)
    {
        return await _context.Menus
            .AnyAsync(m => m.Id == parentMenuId);
    }

    public async Task<bool> HasChildrenAsync(int menuId)
    {
        return await _context.Menus
            .AnyAsync(m => m.ParentMenuId == menuId);
    }

    public async Task<List<Menu>> GetMenusByUserIdAsync(int userId)
    {
        // Step 1: Get user with role
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive);

        // Step 2: Check user exists
        if (user == null)
            throw new InvalidOperationException("User not found or inactive.");

        // Step 3: If Admin, return all active menus
        if (user.Role.Key == "ADMIN")
        {
            return await _context.Menus
                .AsNoTracking()
                .Where(m => m.IsActive)
                .OrderBy(m => m.DisplayOrder)
                .ToListAsync();
        }

        // Step 4: For other roles, return assigned menus
        return await _context.RoleMenus
            .AsNoTracking()
            .Where(rm => rm.RoleId == user.RoleId)
            .Select(rm => rm.Menu)
            .Where(m => m.IsActive)
            .Distinct()
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();
    }

    public async Task AddAsync(Menu menu)
    {
        await _context.Menus.AddAsync(menu);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}