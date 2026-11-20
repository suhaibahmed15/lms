
using LMS.Application.Authorization;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LMS.Infrastructure.Authorization;

public class PermissionAuthorizationHandler
    : AuthorizationHandler<PermissionRequirement>
{
    private readonly ApplicationDbContext _context;

    public PermissionAuthorizationHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // Step 1: Get logged-in user ID from JWT
        var userIdValue = context.User.FindFirstValue("UserId")
            ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
            return;

        // Step 2: Get active user with active role
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted &&
                u.Role != null &&
                u.Role.IsActive &&
                !u.Role.IsDeleted);

        if (user == null)
            return;

        // Step 3: Admin has full permission access
        if (user.Role!.Key.Equals(
            "ADMIN",
            StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
            return;
        }

        var requestedKey = requirement.PermissionKey;

        var isViewPermission = requestedKey.EndsWith(
            "_VIEW",
            StringComparison.OrdinalIgnoreCase);

        var impliedManageKey = GetImpliedManageKey(requestedKey);

        var acceptedKeys = impliedManageKey != null
            ? new[] { requestedKey, impliedManageKey }
            : new[] { requestedKey };

        // Step 4: Check active non-revoked individual permission
        var hasActiveUserPermission =
            await _context.UserPermissions
                .AsNoTracking()
                .AnyAsync(up =>
                    up.UserId == userId &&
                    up.IsActive &&
                    !up.IsDeleted &&
                    up.RevokedAt == null &&
                    acceptedKeys.Contains(up.Permission.Key) &&
                    up.Permission.IsActive &&
                    !up.Permission.IsDeleted);

        if (hasActiveUserPermission)
        {
            context.Succeed(requirement);
            return;
        }

        // Step 5: Explicit individual revocation
        // overrides role permissions and UserMenus VIEW access.
        var hasRevokedUserPermission =
            await _context.UserPermissions
                .AsNoTracking()
                .AnyAsync(up =>
                    up.UserId == userId &&
                    (!up.IsActive || up.RevokedAt != null) &&
                    !up.IsDeleted &&
                    acceptedKeys.Contains(up.Permission.Key) &&
                    up.Permission.IsActive &&
                    !up.Permission.IsDeleted);

        if (hasRevokedUserPermission)
            return;

        // Step 6: UserMenus grants VIEW-only access.
        // It never grants CREATE, UPDATE, DELETE or MANAGE.
        if (isViewPermission)
        {
            var mappedMenuKey =
                GetMappedMenuKeyForView(requestedKey);

            var hasActiveUserMenuView =
                await _context.UserMenus
                    .AsNoTracking()
                    .AnyAsync(um =>
                        um.UserId == userId &&
                        um.IsActive &&
                        !um.IsDeleted &&
                        um.Menu.IsActive &&
                        !um.Menu.IsDeleted &&
                        (_context.Permissions.Any(p =>
                            p.MenuId == um.MenuId &&
                            p.Key == requestedKey &&
                            p.IsActive &&
                            !p.IsDeleted) ||
                         (mappedMenuKey != null &&
                          um.Menu.Key == mappedMenuKey)));

            if (hasActiveUserMenuView)
            {
                context.Succeed(requirement);
                return;
            }
        }

        // Step 7: Check role-based permission
        var hasRolePermission =
            await _context.RolePermissions
                .AsNoTracking()
                .AnyAsync(rp =>
                    rp.RoleId == user.RoleId &&
                    !rp.IsDeleted &&
                    acceptedKeys.Contains(rp.Permission.Key) &&
                    rp.Permission.IsActive &&
                    !rp.Permission.IsDeleted);

        if (hasRolePermission)
        {
            context.Succeed(requirement);
        }
    }

    private static string? GetImpliedManageKey(string permissionKey)
    {
        return permissionKey.ToUpperInvariant() switch
        {
            "ROLE_VIEW" => "ROLE_MANAGE",
            "MENU_VIEW" => "MENU_MANAGE",
            "ROLE_MENU_VIEW" => "MENU_MANAGE",
            "USER_MENU_VIEW" => "MENU_MANAGE",
            "PERMISSION_VIEW" => "PERMISSION_MANAGE",
            "ROLE_PERMISSION_VIEW" => "PERMISSION_MANAGE",
            "USER_PERMISSION_VIEW" => "PERMISSION_MANAGE",
            "STATUS_VIEW" => "STATUS_MANAGE",
            _ => null
        };
    }

    private static string? GetMappedMenuKeyForView(string permissionKey)
    {
        return permissionKey.ToUpperInvariant() switch
        {
            "ROLE_VIEW" => "ROLES",
            "MENU_VIEW" => "MENUS",
            "ROLE_MENU_VIEW" => "ROLE_MENUS",
            "USER_MENU_VIEW" => "USER_MENUS",
            "PERMISSION_VIEW" => "PERMISSIONS",
            "ROLE_PERMISSION_VIEW" => "ROLE_PERMISSIONS",
            "USER_PERMISSION_VIEW" => "USER_PERMISSIONS",
            "STATUS_VIEW" => "STATUSES",
            _ => null
        };
    }
}
