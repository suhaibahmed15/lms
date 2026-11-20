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
            .Where(m => !m.IsDeleted && m.Key != "AUDIT_LOGS")
            .OrderBy(m => m.DisplayOrder)
            .ToListAsync();
    }

    public async Task<(List<Menu> Items, int TotalRecords, int ActiveCount, int InactiveCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive,
        int? parentMenuId)
    {
        var baseQuery = _context.Menus
            .AsNoTracking()
            .Include(m => m.ParentMenu)
            .Where(m => !m.IsDeleted && m.Key != "AUDIT_LOGS");

        var activeCount = await baseQuery.CountAsync(m => m.IsActive);
        var inactiveCount = await baseQuery.CountAsync(m => !m.IsActive);

        var query = baseQuery;

        if (isActive.HasValue)
        {
            query = query.Where(m => m.IsActive == isActive.Value);
        }

        if (parentMenuId.HasValue)
        {
            if (parentMenuId.Value == 0)
            {
                query = query.Where(m => m.ParentMenuId == null);
            }
            else
            {
                query = query.Where(m => m.ParentMenuId == parentMenuId.Value);
            }
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(m =>
                m.Name.ToLower().Contains(term) ||
                m.Key.ToLower().Contains(term) ||
                (m.Route != null && m.Route.ToLower().Contains(term)) ||
                (m.Icon != null && m.Icon.ToLower().Contains(term)) ||
                (m.ParentMenu != null && m.ParentMenu.Name.ToLower().Contains(term)));
        }

        var totalRecords = await query.CountAsync();

        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.Trim().ToLowerInvariant() switch
        {
            "name" => isDesc ? query.OrderByDescending(m => m.Name) : query.OrderBy(m => m.Name),
            "key" => isDesc ? query.OrderByDescending(m => m.Key) : query.OrderBy(m => m.Key),
            "route" => isDesc ? query.OrderByDescending(m => m.Route) : query.OrderBy(m => m.Route),
            "parentmenu" or "parentmenuname" => isDesc
                ? query.OrderByDescending(m => m.ParentMenu != null ? m.ParentMenu.Name : string.Empty)
                : query.OrderBy(m => m.ParentMenu != null ? m.ParentMenu.Name : string.Empty),
            "isactive" or "status" => isDesc ? query.OrderByDescending(m => m.IsActive) : query.OrderBy(m => m.IsActive),
            "createdat" => isDesc ? query.OrderByDescending(m => m.CreatedAt) : query.OrderBy(m => m.CreatedAt),
            "id" => isDesc ? query.OrderByDescending(m => m.Id) : query.OrderBy(m => m.Id),
            _ => isDesc
                ? query
                    .OrderByDescending(m => m.ParentMenu != null ? m.ParentMenu.DisplayOrder : m.DisplayOrder)
                    .ThenByDescending(m => m.ParentMenuId ?? m.Id)
                    .ThenBy(m => m.ParentMenuId == null ? 0 : 1)
                    .ThenByDescending(m => m.DisplayOrder)
                    .ThenByDescending(m => m.Name)
                : query
                    .OrderBy(m => m.ParentMenu != null ? m.ParentMenu.DisplayOrder : m.DisplayOrder)
                    .ThenBy(m => m.ParentMenuId ?? m.Id)
                    .ThenBy(m => m.ParentMenuId == null ? 0 : 1)
                    .ThenBy(m => m.DisplayOrder)
                    .ThenBy(m => m.Name)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalRecords, activeCount, inactiveCount);
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
        // Step 1: Verify active user with active role
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
        {
            throw new InvalidOperationException(
                "User not found or inactive.");
        }

        // Step 2: Load all active menus
        var allMenus = await _context.Menus
            .AsNoTracking()
            .Where(m =>
                m.IsActive &&
                !m.IsDeleted &&
                m.Key != "AUDIT_LOGS")
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.Name)
            .ToListAsync();

        var menuById = allMenus.ToDictionary(m => m.Id);

        // Step 3: Admin gets all active routable menus
        if (user.Role.Key.Equals(
            "ADMIN",
            StringComparison.OrdinalIgnoreCase))
        {
            var adminVisibleIds = new HashSet<int>(
                allMenus
                    .Where(m => !string.IsNullOrWhiteSpace(m.Route))
                    .Select(m => m.Id));

            foreach (var menuId in adminVisibleIds.ToList())
            {
                var parentId = menuById[menuId].ParentMenuId;

                while (parentId.HasValue &&
                       menuById.TryGetValue(parentId.Value, out var parent))
                {
                    adminVisibleIds.Add(parent.Id);
                    parentId = parent.ParentMenuId;
                }
            }

            return allMenus
                .Where(m => adminVisibleIds.Contains(m.Id))
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Name)
                .ToList();
        }

        // Step 4: Get active individual user permissions
        var activeUserPermissions = await _context.UserPermissions
            .AsNoTracking()
            .Where(up =>
                up.UserId == userId &&
                up.IsActive &&
                !up.IsDeleted &&
                up.RevokedAt == null &&
                up.Permission.IsActive &&
                !up.Permission.IsDeleted)
            .Select(up => new
            {
                up.PermissionId,
                up.Permission.MenuId
            })
            .ToListAsync();

        var activeUserPermissionIds = activeUserPermissions
            .Select(x => x.PermissionId)
            .ToHashSet();

        // Step 5: Get explicitly revoked user permissions
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

        // Step 6: Menus assigned through individual permissions
        var userPermissionMenuIds = activeUserPermissions
            .Where(x => x.MenuId.HasValue)
            .Select(x => x.MenuId!.Value)
            .Distinct()
            .ToList();

        // Step 7: Menus assigned through role permissions
        // Exclude permissions explicitly revoked for this user
        var rolePermissionMenuIds = await _context.RolePermissions
            .AsNoTracking()
            .Where(rp =>
                rp.RoleId == user.RoleId &&
                !rp.IsDeleted &&
                !revokedPermissionIds.Contains(rp.PermissionId) &&
                rp.Permission.IsActive &&
                !rp.Permission.IsDeleted &&
                rp.Permission.MenuId.HasValue)
            .Select(rp => rp.Permission.MenuId!.Value)
            .Distinct()
            .ToListAsync();

        // Step 8: Menus directly assigned to the user's role
        var roleMenuIds = await _context.RoleMenus
            .AsNoTracking()
            .Where(rm =>
                rm.RoleId == user.RoleId &&
                rm.IsActive &&
                !rm.IsDeleted &&
                rm.Menu.IsActive &&
                !rm.Menu.IsDeleted)
            .Select(rm => rm.MenuId)
            .Distinct()
            .ToListAsync();

        // Step 9: Menus directly assigned to the individual user
       var roleMenuIds = await _context.RoleMenus
    .AsNoTracking()
    .Where(rm =>
        rm.RoleId == user.RoleId &&
        !rm.IsDeleted &&
        rm.Menu.IsActive &&
        !rm.Menu.IsDeleted)
    .Select(rm => rm.MenuId)
    .Distinct()
    .ToListAsync();

        // Step 10: Combine all four access sources
        var allowedMenuIds = roleMenuIds
            .Union(rolePermissionMenuIds)
            .Union(userMenuIds)
            .Union(userPermissionMenuIds)
            .Where(id =>
                menuById.TryGetValue(id, out var menu) &&
                !string.IsNullOrWhiteSpace(menu.Route))
            .ToHashSet();

        // Step 11: Include parent menus of accessible menus
        var visibleMenuIds = new HashSet<int>(allowedMenuIds);

        foreach (var menuId in allowedMenuIds)
        {
            var parentId = menuById[menuId].ParentMenuId;

            while (parentId.HasValue &&
                   menuById.TryGetValue(parentId.Value, out var parent))
            {
                visibleMenuIds.Add(parent.Id);
                parentId = parent.ParentMenuId;
            }
        }

        // Step 12: Return final menus in display order
        return allMenus
            .Where(m => visibleMenuIds.Contains(m.Id))
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.Name)
            .ToList();
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
