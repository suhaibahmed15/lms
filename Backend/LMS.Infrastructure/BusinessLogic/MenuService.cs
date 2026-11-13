using LMS.Application.DTO.Menus;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class MenuService : IMenuService
{
    private readonly IMenuRepository _menuRepository;

    public MenuService(IMenuRepository menuRepository)
    {
        _menuRepository = menuRepository;
    }

    public async Task<List<MenuResponseDto>> GetAllAsync()
    {
        var menus = await _menuRepository.GetAllAsync();

        return menus.Select(MapToResponse).ToList();
    }

    public async Task<MenuResponseDto?> GetByIdAsync(int id)
    {
        var menu = await _menuRepository.GetByIdAsync(id);

        if (menu == null)
            return null;

        return MapToResponse(menu);
    }

    public async Task<MenuResponseDto> CreateAsync(CreateMenuDto dto)
    {
        var key = dto.Key.Trim();

        if (await _menuRepository.KeyExistsAsync(key))
            throw new InvalidOperationException(
                "A menu with this key already exists.");

        if (dto.ParentMenuId.HasValue)
        {
            var parentExists = await _menuRepository.ParentExistsAsync(
                dto.ParentMenuId.Value);

            if (!parentExists)
                throw new InvalidOperationException(
                    "The selected parent menu does not exist.");
        }

        var menu = new Menu
        {
            Name = dto.Name.Trim(),
            Key = key,
            Route = dto.Route?.Trim(),
            Icon = dto.Icon?.Trim(),
            DisplayOrder = dto.DisplayOrder,
            ParentMenuId = dto.ParentMenuId,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        await _menuRepository.AddAsync(menu);
        await _menuRepository.SaveChangesAsync();

        var savedMenu = await _menuRepository.GetByIdAsync(menu.Id);

        return MapToResponse(savedMenu!);
    }

    public async Task<MenuResponseDto?> UpdateAsync(int id, UpdateMenuDto dto)
    {
        var menu = await _menuRepository.GetByIdAsync(id);

        if (menu == null)
            return null;

        // Update Name only if provided
        if (dto.Name != null)
            menu.Name = dto.Name.Trim();

        // Update Key only if provided
        if (dto.Key != null)
        {
            var key = dto.Key.Trim();

            if (await _menuRepository.KeyExistsAsync(key, id))
                throw new InvalidOperationException(
                    "Another menu with this key already exists.");

            menu.Key = key;
        }

        // Update Route only if provided
        if (dto.Route != null)
            menu.Route = dto.Route.Trim();

        // Update Icon only if provided
        if (dto.Icon != null)
            menu.Icon = dto.Icon.Trim();

        // Update DisplayOrder only if provided
        if (dto.DisplayOrder.HasValue)
            menu.DisplayOrder = dto.DisplayOrder.Value;

        // Update ParentMenuId only if provided
        if (dto.ParentMenuId.HasValue)
        {
            if (dto.ParentMenuId.Value == id)
                throw new InvalidOperationException(
                    "A menu cannot be its own parent.");

            if (!await _menuRepository.ParentExistsAsync(dto.ParentMenuId.Value))
                throw new InvalidOperationException(
                    "The selected parent menu does not exist.");

            menu.ParentMenuId = dto.ParentMenuId.Value;
        }

        // Update IsActive only if provided
        if (dto.IsActive.HasValue)
            menu.IsActive = dto.IsActive.Value;

        menu.UpdatedAt = DateTime.UtcNow;

        await _menuRepository.SaveChangesAsync();

        var updatedMenu = await _menuRepository.GetByIdAsync(id);

        return updatedMenu == null ? null : MapToResponse(updatedMenu);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var menu = await _menuRepository.GetByIdAsync(id);

        if (menu == null)
            return false;

        if (await _menuRepository.HasChildrenAsync(id))
            throw new InvalidOperationException(
                "Delete child menus before deleting this parent menu.");

        // Soft delete
        menu.IsDeleted = true;

        // Deactivate menu
        menu.IsActive = false;

        menu.UpdatedAt = DateTime.UtcNow;

        await _menuRepository.SaveChangesAsync();

        return true;
    }

    private static MenuResponseDto MapToResponse(Menu menu)
    {
        return new MenuResponseDto
        {
            Id = menu.Id,
            Name = menu.Name,
            Key = menu.Key,
            Route = menu.Route,
            Icon = menu.Icon,
            DisplayOrder = menu.DisplayOrder,
            ParentMenuId = menu.ParentMenuId,
            ParentMenuName = menu.ParentMenu?.Name,
            IsActive = menu.IsActive,
            CreatedAt = menu.CreatedAt,
            UpdatedAt = menu.UpdatedAt
        };
    }


    public async Task<List<MenuResponseDto>> GetMenusByUserIdAsync(int userId)
    {
        // Get menus according to user's role
        var menus = await _menuRepository.GetMenusByUserIdAsync(userId);

        // Convert entities into response DTOs
        return menus.Select(MapToResponse).ToList();
    }
}