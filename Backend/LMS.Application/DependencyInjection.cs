using Microsoft.Extensions.DependencyInjection;

namespace LMS.Application;

using LMS.Application.Services;
using LMS.Application.Services.Interfaces;


public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register application services here as each module is implemented.
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}

