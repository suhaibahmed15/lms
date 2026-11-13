using LMS.Application.DTO.RoleMenus;

namespace LMS.Application.Services.Interfaces;

public interface IRoleMenuService
{
    Task<bool> AssignMenuAsync(CreateRoleMenuDto dto);

    Task<List<RoleMenuResponseDto>> GetAllAsync();

    Task<List<RoleMenuResponseDto>> GetMenusByRoleIdAsync(int roleId);

    Task<bool> DeleteAsync(int id);
}