
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IPermissionRepository
{
    Task<List<Permission>> GetAllAsync();

    Task<Permission?> GetByIdAsync(int id);

    Task<bool> KeyExistsAsync(string key, int? excludeId = null);

    Task<List<Permission>> GetPermissionsByUserIdAsync(int userId);

    Task AddAsync(Permission permission);

    Task SaveChangesAsync();
}
