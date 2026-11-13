using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces
{
    public interface IRolePermissionRepository
    {

        Task<bool> RoleExistsAsync(int roleId);
        Task<bool> PermissionExistsAsync(int permissionId);
        Task<bool> AssignmentExistsAsync(int roleId, int permissionId);

        Task<List<RolePermission>> GetAllAsync();
        Task<List<RolePermission>> GetByRoleIdAsync(int roleId);
        Task<RolePermission?> GetByIdAsync(int id);

        Task AddAsync(RolePermission rolePermission);
        Task SaveChangesAsync();
    }
}
