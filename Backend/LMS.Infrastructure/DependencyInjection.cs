using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.BusinessLogic;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Authorization;
using LMS.Infrastructure.BusinessLogic;
using LMS.Infrastructure.Data;
using LMS.Infrastructure.DataAccess;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)

    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.AddHttpContextAccessor();
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        services.AddScoped<ILoanDocumentService, LoanDocumentService>();
        services.AddScoped<ILoanDocumentRepository, LoanDocumentRepository>();
        services.AddScoped<IUserMenuRepository, UserMenuRepository>();
        services.AddScoped<IUserMenuService, UserMenuService>();

        services.AddScoped<ILoanApplicationRepository, LoanApplicationRepository>();
        services.AddScoped<ILoanApplicationService, LoanApplicationService>();


        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.AddScoped<IDashboardService, DashboardService>();

        services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();
        services.AddScoped<IUserPermissionService, UserPermissionService>();

        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<IPermissionService, PermissionService>();

        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
        services.AddScoped<IRolePermissionService, RolePermissionService>();

        services.AddScoped<IRoleMenuRepository, RoleMenuRepository>();
        services.AddScoped<IRoleMenuService, RoleMenuService>();
        services.AddScoped<IMenuRepository, MenuRepository>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IStatusRepository, StatusRepository>();
        services.AddScoped<IStatusService, StatusService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        // Register repository implementations here as each module is implemented.
        return services;
    }
}

