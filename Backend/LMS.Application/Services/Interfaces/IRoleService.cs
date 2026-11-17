
using LMS.Application.DTO.Roles;

namespace LMS.Application.Services.Interfaces;

public interface IRoleService
{
    Task<List<RoleResponseDto>> GetAllAsync();

    Task<RoleResponseDto?> GetByIdAsync(int id);

    // Get the current user's assigned role.
    Task<RoleResponseDto?> GetMyRoleAsync(int userId);

    Task<RoleResponseDto> CreateAsync(CreateRoleDto dto);

    Task<RoleResponseDto?> UpdateAsync(int id, UpdateRoleDto dto);

    Task<bool> DeleteAsync(int id);

    Task<bool?> ChangeStatusAsync(int id, bool isActive);
}
