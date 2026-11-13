using LMS.Application.DTO.RolePermissions;


namespace LMS.Application.Services.Interfaces;

public interface IRolePermissionService
{
    Task<bool> AssignPermissionAsync(CreateRolePermissionDto dto);

    Task<List<RolePermissionResponseDto>> GetAllAsync();

    Task<List<RolePermissionResponseDto>> GetByRoleIdAsync(int roleId);

    Task<bool> DeleteAsync(int id);
}