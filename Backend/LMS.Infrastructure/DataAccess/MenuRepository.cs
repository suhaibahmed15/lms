
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
        // Step 1: Verify user
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted);

        if (user == null)
        {
            throw new InvalidOperationException(
                "User not found or inactive.");
        }

        // Step 2: Admin can access all active menus
        if (user.Role != null &&
            user.Role.Key.Equals(
                "ADMIN",
                StringComparison.OrdinalIgnoreCase))
        {
            return await _context.Menus
                .AsNoTracking()
                .Include(m => m.ParentMenu)
                .Where(m => m.IsActive && !m.IsDeleted)
                .OrderBy(m => m.DisplayOrder)
                .ToListAsync();
        }

        // Step 3: Find explicitly revoked permissions
        var revokedPermissionIds = await _context.UserPermissions
            .Where(up =>
                up.UserId == userId &&
                !up.IsActive &&
                !up.IsDeleted &&
                up.RevokedAt != null &&
                up.Permission.IsActive &&
                !up.Permission.IsDeleted)
            .Where(up => !_context.UserPermissions.Any(active =>
                active.UserId == userId &&
                active.PermissionId == up.PermissionId &&
                active.IsActive &&
                !active.IsDeleted))
            .Select(up => up.PermissionId)
            .Distinct()
            .ToListAsync();

        // Step 4: Get active individual user permissions
        var userPermissionMenuIds = await _context.UserPermissions
            .Where(up =>
                up.UserId == userId &&
                up.IsActive &&
                !up.IsDeleted &&
                up.Permission.IsActive &&
                !up.Permission.IsDeleted &&
                up.Permission.MenuId.HasValue)
            .Select(up => up.Permission.MenuId!.Value)
            .Distinct()
            .ToListAsync();

        // Step 5: Get active role permissions
        var rolePermissionMenuIds = await _context.RolePermissions
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

        // Step 6: Combine allowed permission menu IDs
        var allowedMenuIds = rolePermissionMenuIds
            .Union(userPermissionMenuIds)
            .Distinct()
            .ToHashSet();

        // Step 7: Get all active menus
        var allMenus = await _context.Menus
            .AsNoTracking()
            .Include(m => m.ParentMenu)
            .Where(m => m.IsActive && !m.IsDeleted)
            .ToListAsync();

        // Step 8: Include only authorized menus
        var visibleMenuIds = new HashSet<int>(allowedMenuIds);

        // Step 9: Include parent menus of authorized children
        foreach (var menu in allMenus)
        {
            if (!allowedMenuIds.Contains(menu.Id))
                continue;

            var parentId = menu.ParentMenuId;

            while (parentId.HasValue)
            {
                var parent = allMenus.FirstOrDefault(
                    m => m.Id == parentId.Value);

                if (parent == null)
                    break;

                visibleMenuIds.Add(parent.Id);

                parentId = parent.ParentMenuId;
            }
        }

        // Step 10: Return authorized menus
        return allMenus
            .Where(m => visibleMenuIds.Contains(m.Id))
            .OrderBy(m => m.DisplayOrder)
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
