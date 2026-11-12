
using LMS.Application.DTO.Users;

namespace LMS.Application.Services.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();

    Task<UserResponseDto?> GetByIdAsync(int id);

    Task<UserResponseDto> CreateAsync(CreateUserDto dto);

    Task<UserResponseDto?> UpdateAsync(
        int id,
        UpdateUserDto dto);

    Task<bool?> ChangeStatusAsync(int id, bool isActive);

    Task<bool> DeleteAsync(int id);
}
