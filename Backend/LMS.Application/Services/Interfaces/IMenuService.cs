using LMS.Application.DTO.Menus;

namespace LMS.Application.Services.Interfaces;

public interface IMenuService
{
    Task<List<MenuResponseDto>> GetAllAsync();

    Task<MenuResponseDto?> GetByIdAsync(int id);

    Task<MenuResponseDto> CreateAsync(CreateMenuDto dto);

    Task<MenuResponseDto?> UpdateAsync(int id, UpdateMenuDto dto);

    Task<List<MenuResponseDto>> GetMenusByUserIdAsync(int userId);

    Task<bool> DeleteAsync(int id);
}