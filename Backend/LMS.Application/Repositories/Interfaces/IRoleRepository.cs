using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IRoleRepository
{
    Task<List<Role>> GetAllAsync();

    Task<Role?> GetByIdAsync(int id);

    Task<bool> ExistsByNameAsync(string name);

    Task<bool> ExistsByKeyAsync(string key);

    Task<bool> ExistsByNameAsync(string name, int excludeId);

    Task<bool> ExistsByKeyAsync(string key, int excludeId);

    Task AddAsync(Role role);

    Task UpdateAsync(Role role);

    Task<bool> HasAssignedUsersAsync(int roleId);

    Task<bool> HasAssignedPermissionsAsync(int roleId);

    Task<bool> HasAssignedMenusAsync(int roleId);

    Task SaveChangesAsync();
}