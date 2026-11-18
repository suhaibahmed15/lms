
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
            .AsNoTracking()
            .Include(um => um.User)
            .Include(um => um.Menu)
            .Where(um =>
                !um.IsDeleted &&
                um.IsActive &&
                um.User.IsActive &&
                !um.User.IsDeleted &&
                um.Menu.IsActive &&
                !um.Menu.IsDeleted &&
                um.Menu.Key != "AUDIT_LOGS")
            .OrderByDescending(um => um.CreatedAt)
            .ToListAsync();
    }

    public async Task<(List<UserMenu> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? userId,
        int? menuId,
        bool? isActive)
    {
        var query = _context.UserMenus
            .AsNoTracking()
            .Include(um => um.User)
            .Include(um => um.Menu)
            .Where(um =>
                !um.IsDeleted &&
                um.User.IsActive &&
                !um.User.IsDeleted &&
                um.Menu.IsActive &&
                !um.Menu.IsDeleted &&
                um.Menu.Key != "AUDIT_LOGS");

        if (userId.HasValue)
        {
            query = query.Where(um => um.UserId == userId.Value);
        }

        if (menuId.HasValue)
        {
            query = query.Where(um => um.MenuId == menuId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(um => um.IsActive == isActive.Value);
        }
        else
        {
            query = query.Where(um => um.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(um =>
                um.User.FullName.ToLower().Contains(term) ||
                um.Menu.Name.ToLower().Contains(term) ||
                um.Menu.Key.ToLower().Contains(term) ||
                (um.Menu.Route != null && um.Menu.Route.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "username" => isDesc ? query.OrderByDescending(um => um.User.FullName) : query.OrderBy(um => um.User.FullName),
            "menuname" => isDesc ? query.OrderByDescending(um => um.Menu.Name) : query.OrderBy(um => um.Menu.Name),
            "menukey" => isDesc ? query.OrderByDescending(um => um.Menu.Key) : query.OrderBy(um => um.Menu.Key),
            "route" => isDesc ? query.OrderByDescending(um => um.Menu.Route) : query.OrderBy(um => um.Menu.Route),
            "id" => isDesc ? query.OrderByDescending(um => um.Id) : query.OrderBy(um => um.Id),
            _ => isDesc ? query.OrderByDescending(um => um.CreatedAt) : query.OrderBy(um => um.CreatedAt)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<List<UserMenu>> GetByUserIdAsync(int userId)
    {
        return await _context.UserMenus
            .AsNoTracking()
            .Include(um => um.User)
            .Include(um => um.Menu)
            .Where(um =>
                um.UserId == userId &&
                !um.IsDeleted &&
                um.IsActive &&
                um.Menu.IsActive &&
                !um.Menu.IsDeleted &&
                um.Menu.Key != "AUDIT_LOGS")
            .OrderBy(um => um.Menu.DisplayOrder)
            .ToListAsync();
    }

    public async Task<(List<UserMenu> Items, int TotalRecords)> GetPagedByUserIdAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection)
    {
        var query = _context.UserMenus
            .AsNoTracking()
            .Include(um => um.User)
            .Include(um => um.Menu)
            .Where(um =>
                um.UserId == userId &&
                !um.IsDeleted &&
                um.IsActive &&
                um.Menu.IsActive &&
                !um.Menu.IsDeleted &&
                um.Menu.Key != "AUDIT_LOGS");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(um =>
                um.Menu.Name.ToLower().Contains(term) ||
                um.Menu.Key.ToLower().Contains(term) ||
                (um.Menu.Route != null && um.Menu.Route.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "menuname" => isDesc ? query.OrderByDescending(um => um.Menu.Name) : query.OrderBy(um => um.Menu.Name),
            "menukey" => isDesc ? query.OrderByDescending(um => um.Menu.Key) : query.OrderBy(um => um.Menu.Key),
            "route" => isDesc ? query.OrderByDescending(um => um.Menu.Route) : query.OrderBy(um => um.Menu.Route),
            "createdat" => isDesc ? query.OrderByDescending(um => um.CreatedAt) : query.OrderBy(um => um.CreatedAt),
            _ => isDesc ? query.OrderByDescending(um => um.Menu.DisplayOrder) : query.OrderBy(um => um.Menu.DisplayOrder)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    public async Task<UserMenu?> GetByIdAsync(int id)
    {
        return await _context.UserMenus
            .Include(um => um.User)
            .Include(um => um.Menu)
            .FirstOrDefaultAsync(um => um.Id == id && !um.IsDeleted);
    }

    public async Task<bool> UserExistsAsync(int userId)
    {
        return await _context.Users.AnyAsync(
            u => u.Id == userId && u.IsActive && !u.IsDeleted);
    }

    public async Task<bool> MenuExistsAsync(int menuId)
    {
        return await _context.Menus.AnyAsync(
            m => m.Id == menuId && m.IsActive && !m.IsDeleted);
    }

    public async Task<bool> AssignmentExistsAsync(int userId, int menuId)
    {
        return await _context.UserMenus
            .AnyAsync(um =>
                um.UserId == userId &&
                um.MenuId == menuId &&
                !um.IsDeleted &&
                um.IsActive);
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
