using LMS.Application.DTO.RoleMenus;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace LMS.Infrastructure.BusinessLogic;

public class RoleMenuService : IRoleMenuService
{
    private readonly IRoleMenuRepository _roleMenuRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RoleMenuService(
        IRoleMenuRepository roleMenuRepository,
        IHttpContextAccessor httpContextAccessor)
    {
        _roleMenuRepository = roleMenuRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    // POST: Assign menu to role
    public async Task<bool> AssignMenuAsync(CreateRoleMenuDto dto)
    {
        if (!await _roleMenuRepository.RoleExistsAsync(dto.RoleId))
            throw new InvalidOperationException("Role not found or inactive.");

        if (!await _roleMenuRepository.MenuExistsAsync(dto.MenuId))
            throw new InvalidOperationException("Menu not found or inactive.");

        if (await _roleMenuRepository.AssignmentExistsAsync(
            dto.RoleId, dto.MenuId))
        {
            throw new InvalidOperationException(
                "This menu is already assigned to this role.");
        }

        var existing = await _roleMenuRepository.GetExistingAssignmentAsync(dto.RoleId, dto.MenuId);
        if (existing != null)
        {
            existing.IsDeleted = false;
            await _roleMenuRepository.SaveChangesAsync();
            return true;
        }

        var roleMenu = new RoleMenu
        {
            RoleId = dto.RoleId,
            MenuId = dto.MenuId,
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

    public async Task<object> GetPagedAsync()
    {
        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 10;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
        int? roleId = int.TryParse(query?["roleId"], out var rId) ? rId : null;
        int? menuId = int.TryParse(query?["menuId"], out var mId) ? mId : null;
        bool? isActive = bool.TryParse(query?["isActive"], out var active) ? active : null;

        var (items, totalRecords) = await _roleMenuRepository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, roleId, menuId, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "Role menu assignments retrieved successfully.",
            data = items.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages
        };
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