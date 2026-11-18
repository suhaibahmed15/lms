
using LMS.Application.DTO.UserMenus;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace LMS.Application.Services.BusinessLogic;

public class UserMenuService : IUserMenuService
{
    private readonly IUserMenuRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserMenuService(
        IUserMenuRepository repository,
        IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<UserMenuResponseDto>> GetAllAsync()
    {
        var userMenus = await _repository.GetAllAsync();

        return userMenus.Select(MapToResponse).ToList();
    }

    public async Task<object> GetPagedAsync()
    {
        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 10;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
        int? userId = int.TryParse(query?["userId"], out var uId) ? uId : null;
        int? menuId = int.TryParse(query?["menuId"], out var mId) ? mId : null;
        bool? isActive = bool.TryParse(query?["isActive"], out var active) ? active : null;

        var (items, totalRecords) = await _repository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, userId, menuId, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "User menu assignments retrieved successfully.",
            data = items.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    public async Task<List<UserMenuResponseDto>> GetByUserIdAsync(int userId)
    {
        if (userId <= 0)
            throw new ArgumentException("Invalid user ID.");

        var userMenus = await _repository.GetByUserIdAsync(userId);

        return userMenus.Select(MapToResponse).ToList();
    }

    public async Task<object> GetPagedByUserIdAsync(int userId)
    {
        if (userId <= 0)
            throw new ArgumentException("Invalid user ID.");

        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 100;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";

        var (items, totalRecords) = await _repository.GetPagedByUserIdAsync(
            userId, pageNumber, pageSize, search, sortBy, sortDirection);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "User menus retrieved successfully.",
            data = items.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    public async Task<UserMenuResponseDto> AssignMenuAsync(
        CreateUserMenuDto dto)
    {
        if (!await _repository.UserExistsAsync(dto.UserId))
            throw new ArgumentException("User not found or inactive.");

        if (!await _repository.MenuExistsAsync(dto.MenuId))
            throw new ArgumentException("Menu not found or inactive.");

        var existingMenu = await _repository.GetExistingAssignmentAsync(
            dto.UserId,
            dto.MenuId);

        if (existingMenu != null)
        {
            if (!existingMenu.IsDeleted && existingMenu.IsActive)
            {
                throw new InvalidOperationException(
                    "This menu is already assigned to the user.");
            }

            existingMenu.IsDeleted = false;
            existingMenu.IsActive = true;

            await _repository.SaveChangesAsync();

            return MapToResponse(existingMenu);
        }

        var userMenu = new UserMenu
        {
            UserId = dto.UserId,
            MenuId = dto.MenuId,
            IsActive = true
        };

        await _repository.AddAsync(userMenu);
        await _repository.SaveChangesAsync();

        var savedMenu = await _repository.GetByIdAsync(userMenu.Id);

        return MapToResponse(savedMenu!);
    }

    public async Task<bool> RemoveMenuAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid assignment ID.");

        var userMenu = await _repository.GetByIdAsync(id);

        if (userMenu == null)
            throw new ArgumentException("User menu assignment not found.");

        userMenu.IsActive = false;
        userMenu.IsDeleted = true;

        await _repository.SaveChangesAsync();

        return true;
    }

    private static UserMenuResponseDto MapToResponse(UserMenu userMenu)
    {
        return new UserMenuResponseDto
        {
            Id = userMenu.Id,
            UserId = userMenu.UserId,
            UserName = userMenu.User.FullName,
            MenuId = userMenu.MenuId,
            MenuName = userMenu.Menu.Name,
            MenuKey = userMenu.Menu.Key,
            Route = userMenu.Menu.Route,
            IsActive = userMenu.IsActive,
            CreatedAt = userMenu.CreatedAt,
            UpdatedAt = userMenu.UpdatedAt
        };
    }
}
