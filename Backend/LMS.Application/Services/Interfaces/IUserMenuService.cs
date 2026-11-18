
using LMS.Application.DTO.UserMenus;

namespace LMS.Application.Services.Interfaces;

public interface IUserMenuService
{
    Task<List<UserMenuResponseDto>> GetAllAsync();

    Task<object> GetPagedAsync();

    Task<List<UserMenuResponseDto>> GetByUserIdAsync(int userId);

    Task<object> GetPagedByUserIdAsync(int userId);

    Task<UserMenuResponseDto> AssignMenuAsync(CreateUserMenuDto dto);

    Task<bool> RemoveMenuAsync(int id);
}
