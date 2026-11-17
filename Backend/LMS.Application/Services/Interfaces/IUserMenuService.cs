
using LMS.Application.DTO.UserMenus;

namespace LMS.Application.Services.Interfaces;

public interface IUserMenuService
{
    Task<List<UserMenuResponseDto>> GetAllAsync();

    Task<List<UserMenuResponseDto>> GetByUserIdAsync(int userId);

    Task<UserMenuResponseDto> AssignMenuAsync(CreateUserMenuDto dto);

    Task<bool> RemoveMenuAsync(int id);
}
