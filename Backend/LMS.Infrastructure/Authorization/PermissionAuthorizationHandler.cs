
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

    public PermissionAuthorizationHandler(
        ApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // Step 1: Get logged-in user ID from JWT
        var userIdValue = context.User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return;
        }

        // Step 2: Get active user with role
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                !u.IsDeleted);

        if (user == null)
        {
            return;
        }

        // Step 3: Admin has full permission access
        if (user.Role != null &&
            user.Role.Key.Equals(
                "ADMIN",
                StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
            return;
        }

        // Step 4: Check active individual permission
        var hasActiveUserPermission =
            await _context.UserPermissions.AnyAsync(up =>
                up.UserId == userId &&
                up.IsActive &&
                !up.IsDeleted &&
                up.Permission.Key == requirement.PermissionKey &&
                up.Permission.IsActive &&
                !up.Permission.IsDeleted);

        if (hasActiveUserPermission)
        {
            context.Succeed(requirement);
            return;
        }

        // Step 5: Check whether this user explicitly revoked
        // the requested permission and has not received it again.
        var hasRevokedUserPermission =
            await _context.UserPermissions.AnyAsync(up =>
                up.UserId == userId &&
                !up.IsActive &&
                !up.IsDeleted &&
                up.Permission.Key == requirement.PermissionKey &&
                up.Permission.IsActive &&
                !up.Permission.IsDeleted);

        if (hasRevokedUserPermission)
        {
            // Explicit individual revocation overrides role access.
            return;
        }

        // Step 6: Check role-based permission
        var hasRolePermission =
            await _context.RolePermissions.AnyAsync(rp =>
                rp.RoleId == user.RoleId &&
                !rp.IsDeleted &&
                rp.Permission.Key == requirement.PermissionKey &&
                rp.Permission.IsActive &&
                !rp.Permission.IsDeleted);

        if (hasRolePermission)
        {
            context.Succeed(requirement);
        }
    }
}
