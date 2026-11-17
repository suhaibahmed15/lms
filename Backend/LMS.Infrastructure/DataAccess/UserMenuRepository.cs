
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class UserMenuRepository : IUserMenuRepository
{
    private readonly ApplicationDbContext _context;

    public UserMenuRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserMenu>> GetAllAsync()
    {
        return await _context.UserMenus
            .Include(um => um.User)
            .Include(um => um.Menu)
            .OrderByDescending(um => um.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<UserMenu>> GetByUserIdAsync(int userId)
    {
        return await _context.UserMenus
            .Include(um => um.User)
            .Include(um => um.Menu)
            .Where(um => um.UserId == userId)
            .OrderBy(um => um.Menu.DisplayOrder)
            .ToListAsync();
    }

    public async Task<UserMenu?> GetByIdAsync(int id)
    {
        return await _context.UserMenus
            .Include(um => um.User)
            .Include(um => um.Menu)
            .FirstOrDefaultAsync(um => um.Id == id);
    }

    public async Task<bool> UserExistsAsync(int userId)
    {
        return await _context.Users.AnyAsync(
            u => u.Id == userId && u.IsActive);
    }

    public async Task<bool> MenuExistsAsync(int menuId)
    {
        return await _context.Menus.AnyAsync(
            m => m.Id == menuId && m.IsActive);
    }

    public async Task<bool> AssignmentExistsAsync(int userId, int menuId)
    {
        return await _context.UserMenus
            .AnyAsync(um => um.UserId == userId && um.MenuId == menuId);
    }

    public async Task<UserMenu?> GetExistingAssignmentAsync(
    int userId,
    int menuId)
    {
        return await _context.UserMenus
            .IgnoreQueryFilters()
            .Include(um => um.User)
            .Include(um => um.Menu)
            .FirstOrDefaultAsync(
                um => um.UserId == userId && um.MenuId == menuId);
    }

    public async Task AddAsync(UserMenu userMenu)
    {
        await _context.UserMenus.AddAsync(userMenu);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
