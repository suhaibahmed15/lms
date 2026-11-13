
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IUserPermissionRepository
{
    Task<bool> UserExistsAsync(int userId);

    Task<bool> PermissionExistsAsync(int permissionId);

    Task<bool> PermissionIsActiveAsync(int permissionId);

    Task<bool> AssignmentExistsAsync(int userId, int permissionId);

    Task<List<UserPermission>> GetAllAsync();

    Task<List<UserPermission>> GetByUserIdAsync(int userId);

    Task<UserPermission?> GetByIdAsync(int id);

    Task AddAsync(UserPermission userPermission);

    void Update(UserPermission userPermission);

    Task SaveChangesAsync();
}
