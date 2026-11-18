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
            .AnyAsync(r => r.Id == roleId && r.IsActive && !r.IsDeleted);
    }

    public async Task<bool> MenuExistsAsync(int menuId)
    {
        return await _context.Menus
            .AnyAsync(m => m.Id == menuId && m.IsActive && !m.IsDeleted);
    }

    public async Task<bool> AssignmentExistsAsync(int roleId, int menuId)
    {
        return await _context.RoleMenus
            .AnyAsync(rm =>
                rm.RoleId == roleId &&
                rm.MenuId == menuId &&
                !rm.IsDeleted);
    }

    public async Task<RoleMenu?> GetExistingAssignmentAsync(int roleId, int menuId)
    {
        return await _context.RoleMenus
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(rm =>
                rm.RoleId == roleId &&
                rm.MenuId == menuId);
    }

    // Get all role-menu assignments
    public async Task<List<RoleMenu>> GetAllAsync()
    {
        return await _context.RoleMenus
            .AsNoTracking()
            .Include(rm => rm.Menu)
            .Where(rm => !rm.IsDeleted && rm.Menu.IsActive && !rm.Menu.IsDeleted && rm.Menu.Key != "AUDIT_LOGS")
            .OrderBy(rm => rm.RoleId)
            .ThenBy(rm => rm.Menu.DisplayOrder)
            .ToListAsync();
    }

    public async Task<(List<RoleMenu> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? roleId,
        int? menuId,
        bool? isActive)
    {
        var query = _context.RoleMenus
            .AsNoTracking()
            .Include(rm => rm.Menu)
            .Where(rm => !rm.IsDeleted && !rm.Menu.IsDeleted && rm.Menu.Key != "AUDIT_LOGS");

        if (roleId.HasValue)
        {
            query = query.Where(rm => rm.RoleId == roleId.Value);
        }

        if (menuId.HasValue)
        {
            query = query.Where(rm => rm.MenuId == menuId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(rm => rm.Menu.IsActive == isActive.Value);
        }
        else
        {
            query = query.Where(rm => rm.Menu.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(rm =>
                rm.Menu.Name.ToLower().Contains(term) ||
                rm.Menu.Key.ToLower().Contains(term) ||
                (rm.Menu.Route != null && rm.Menu.Route.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "menuname" => isDesc ? query.OrderByDescending(rm => rm.Menu.Name) : query.OrderBy(rm => rm.Menu.Name),
            "menukey" => isDesc ? query.OrderByDescending(rm => rm.Menu.Key) : query.OrderBy(rm => rm.Menu.Key),
            "displayorder" => isDesc ? query.OrderByDescending(rm => rm.Menu.DisplayOrder) : query.OrderBy(rm => rm.Menu.DisplayOrder),
            "createdat" => isDesc ? query.OrderByDescending(rm => rm.CreatedAt) : query.OrderBy(rm => rm.CreatedAt),
            _ => isDesc ? query.OrderByDescending(rm => rm.RoleId).ThenByDescending(rm => rm.Menu.DisplayOrder) : query.OrderBy(rm => rm.RoleId).ThenBy(rm => rm.Menu.DisplayOrder)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords);
    }

    // Get active menus assigned to a particular role
    public async Task<List<RoleMenu>> GetMenusByRoleIdAsync(int roleId)
    {
        return await _context.RoleMenus
            .AsNoTracking()
            .Include(rm => rm.Menu)
            .Where(rm =>
                rm.RoleId == roleId &&
                !rm.IsDeleted &&
                rm.Menu.IsActive &&
                !rm.Menu.IsDeleted &&
                rm.Menu.Key != "AUDIT_LOGS")
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