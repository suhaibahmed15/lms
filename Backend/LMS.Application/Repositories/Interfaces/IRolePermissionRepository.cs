using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces
{
    public interface IRolePermissionRepository
    {

        Task<bool> RoleExistsAsync(int roleId);
        Task<bool> PermissionExistsAsync(int permissionId);
        Task<bool> AssignmentExistsAsync(int roleId, int permissionId);
        Task<RolePermission?> GetExistingAssignmentAsync(int roleId, int permissionId);

        Task<List<RolePermission>> GetAllAsync();
        Task<(List<RolePermission> Items, int TotalRecords)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            string? sortBy,
            string? sortDirection,
            int? roleId,
            int? permissionId,
            bool? isActive);
        Task<List<RolePermission>> GetByRoleIdAsync(int roleId);
        Task<RolePermission?> GetByIdAsync(int id);

        Task AddAsync(RolePermission rolePermission);
        Task SaveChangesAsync();
    }
}
