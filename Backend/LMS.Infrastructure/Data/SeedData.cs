using LMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Infrastructure.Data;

public static class SeedData
{
    public const string DefaultAdminRoleName = "Admin";
    public const string DefaultAdminRoleKey = "ADMIN";

    public static async Task InitializeAsync(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        bool isDevelopment,
        CancellationToken cancellationToken = default)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync(cancellationToken);

        // Seed only the Admin role initially; Admin creates additional roles (Loan Officer, Customer, etc.) later.
        var adminRole = await context.Roles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Key == DefaultAdminRoleKey && !r.IsDeleted, cancellationToken);

        if (adminRole is null)
        {
            adminRole = new Role
            {
                Name = DefaultAdminRoleName,
                Key = DefaultAdminRoleKey,
                Description = "System administrator with full access to create roles, user profiles, and manage permissions.",
                IsActive = true
            };

            context.Roles.Add(adminRole);
            await context.SaveChangesAsync(cancellationToken);
        }

        // Ensure ADMIN role always has all active permissions assigned by default
        var allActivePermissions = await context.Permissions
            .IgnoreQueryFilters()
            .Where(p => p.IsActive && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        if (allActivePermissions.Any())
        {
            var existingAdminPermIds = await context.RolePermissions
                .IgnoreQueryFilters()
                .Where(rp => rp.RoleId == adminRole.Id && !rp.IsDeleted)
                .Select(rp => rp.PermissionId)
                .ToListAsync(cancellationToken);

            var missingPerms = allActivePermissions
                .Where(p => !existingAdminPermIds.Contains(p.Id))
                .ToList();

            if (missingPerms.Any())
            {
                var adminUserId = await context.Users
                    .IgnoreQueryFilters()
                    .Where(u => u.RoleId == adminRole.Id && !u.IsDeleted)
                    .Select(u => (int?)u.Id)
                    .FirstOrDefaultAsync(cancellationToken) ?? 1;

                foreach (var perm in missingPerms)
                {
                    var existingSoftDeleted = await context.RolePermissions
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id, cancellationToken);

                    if (existingSoftDeleted != null)
                    {
                        existingSoftDeleted.IsDeleted = false;
                        existingSoftDeleted.UpdatedAt = DateTime.UtcNow;
                        existingSoftDeleted.UpdatedBy = adminUserId;
                    }
                    else
                    {
                        context.RolePermissions.Add(new RolePermission
                        {
                            RoleId = adminRole.Id,
                            PermissionId = perm.Id,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = adminUserId,
                            IsDeleted = false
                        });
                    }
                }
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        // Ensure ADMIN role always has all active menus assigned by default
        var allActiveMenus = await context.Menus
            .IgnoreQueryFilters()
            .Where(m => m.IsActive && !m.IsDeleted)
            .ToListAsync(cancellationToken);

        if (allActiveMenus.Any())
        {
            var existingAdminMenuIds = await context.RoleMenus
                .IgnoreQueryFilters()
                .Where(rm => rm.RoleId == adminRole.Id && !rm.IsDeleted)
                .Select(rm => rm.MenuId)
                .ToListAsync(cancellationToken);

            var missingMenus = allActiveMenus
                .Where(m => !existingAdminMenuIds.Contains(m.Id))
                .ToList();

            if (missingMenus.Any())
            {
                var adminUserId = await context.Users
                    .IgnoreQueryFilters()
                    .Where(u => u.RoleId == adminRole.Id && !u.IsDeleted)
                    .Select(u => (int?)u.Id)
                    .FirstOrDefaultAsync(cancellationToken) ?? 1;

                foreach (var menu in missingMenus)
                {
                    var existingSoftDeleted = await context.RoleMenus
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(rm => rm.RoleId == adminRole.Id && rm.MenuId == menu.Id, cancellationToken);

                    if (existingSoftDeleted != null)
                    {
                        existingSoftDeleted.IsDeleted = false;
                        existingSoftDeleted.UpdatedAt = DateTime.UtcNow;
                        existingSoftDeleted.UpdatedBy = adminUserId;
                    }
                    else
                    {
                        context.RoleMenus.Add(new RoleMenu
                        {
                            RoleId = adminRole.Id,
                            MenuId = menu.Id,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = adminUserId,
                            IsDeleted = false
                        });
                    }
                }
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        // Seed only the initial Admin user credentials if no Admin user exists yet.
        var hasAdminUser = await context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.RoleId == adminRole.Id && !u.IsDeleted, cancellationToken);

        if (hasAdminUser)
        {
            return;
        }

        var email = configuration["SeedAdmin:Email"];
        var fullName = configuration["SeedAdmin:FullName"];
        var phoneNumber = configuration["SeedAdmin:PhoneNumber"];
        var password = configuration["SeedAdmin:Password"];

        if (string.IsNullOrWhiteSpace(email))
        {
            email = isDevelopment
                ? "admin@lms.local"
                : throw new InvalidOperationException("SeedAdmin:Email must be configured outside Development.");
        }

        if (string.IsNullOrWhiteSpace(fullName))
        {
            fullName = "System Administration";
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            password = isDevelopment
                ? "Admin@12345"
                : throw new InvalidOperationException("SeedAdmin:Password must be configured outside Development.");
        }

        var emailAlreadyExists = await context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);

        if (emailAlreadyExists)
        {
            throw new InvalidOperationException(
                 $"The configured admin email '{email}' already belongs to another user.");
        }

        var adminUser = new User
        {
            RoleId = adminRole.Id,
            FullName = fullName,
            Email = email,
            PhoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? null : phoneNumber,
            IsActive = true
        };

        var passwordHasher = new PasswordHasher<User>();
        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, password);

        context.Users.Add(adminUser);
        await context.SaveChangesAsync(cancellationToken);
    }
}
