using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Infrastructure.DataAccess;
using LMS.Infrastructure.Services;
using LMS.Infrastructure.BusinessLogic;

namespace LMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)

    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        // Register repository implementations here as each module is implemented.
        return services;
    }
}

