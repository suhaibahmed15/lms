using LMS.Application.DTO.RoleMenus;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class RoleMenuService : IRoleMenuService
{
    private readonly IRoleMenuRepository _roleMenuRepository;

    public RoleMenuService(IRoleMenuRepository roleMenuRepository)
    {
        _roleMenuRepository = roleMenuRepository;
    }

    // POST: Assign menu to role
    public async Task<bool> AssignMenuAsync(CreateRoleMenuDto dto)
    {
        if (!await _roleMenuRepository.RoleExistsAsync(dto.RoleId))
            throw new InvalidOperationException("Role not found.");

        if (!await _roleMenuRepository.MenuExistsAsync(dto.MenuId))
            throw new InvalidOperationException("Menu not found.");

        if (await _roleMenuRepository.AssignmentExistsAsync(
            dto.RoleId, dto.MenuId))
        {
            throw new InvalidOperationException(
                "This menu is already assigned to this role.");
        }

        var roleMenu = new RoleMenu
        {
            RoleId = dto.RoleId,
            MenuId = dto.MenuId,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        await _roleMenuRepository.AddAsync(roleMenu);
        await _roleMenuRepository.SaveChangesAsync();

        return true;
    }

    // GET: Get all assignments
    public async Task<List<RoleMenuResponseDto>> GetAllAsync()
    {
        var roleMenus = await _roleMenuRepository.GetAllAsync();

        return roleMenus.Select(MapToResponse).ToList();
    }

    // GET: Get menus by role ID
    public async Task<List<RoleMenuResponseDto>> GetMenusByRoleIdAsync(
        int roleId)
    {
        if (!await _roleMenuRepository.RoleExistsAsync(roleId))
            throw new InvalidOperationException("Role not found.");

        var roleMenus =
            await _roleMenuRepository.GetMenusByRoleIdAsync(roleId);

        return roleMenus.Select(MapToResponse).ToList();
    }

    // DELETE: Soft-delete assignment
    public async Task<bool> DeleteAsync(int id)
    {
        var roleMenu = await _roleMenuRepository.GetByIdAsync(id);

        if (roleMenu == null)
            return false;

        roleMenu.IsDeleted = true;
        roleMenu.UpdatedAt = DateTime.UtcNow;

        await _roleMenuRepository.SaveChangesAsync();

        return true;
    }

    // Map entity to response DTO
    private static RoleMenuResponseDto MapToResponse(RoleMenu rm)
    {
        return new RoleMenuResponseDto
        {
            Id = rm.Id,
            RoleId = rm.RoleId,
            MenuId = rm.MenuId,

            MenuName = rm.Menu.Name,
            MenuKey = rm.Menu.Key,
            Route = rm.Menu.Route,
            Icon = rm.Menu.Icon,

            DisplayOrder = rm.Menu.DisplayOrder,
            ParentMenuId = rm.Menu.ParentMenuId,
            IsActive = rm.Menu.IsActive,

            CreatedAt = rm.CreatedAt,
            UpdatedAt = rm.UpdatedAt
        };
    }
}