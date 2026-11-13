using LMS.Application.DTO.Permissions;

namespace LMS.Application.Services.Interfaces;

public interface IPermissionService
{
    Task<PermissionResponseDto> CreateAsync(CreatePermissionDto dto);

    Task<List<PermissionResponseDto>> GetAllAsync();

    Task<PermissionResponseDto?> GetByIdAsync(int id);

    Task<PermissionResponseDto?> UpdateAsync(int id, UpdatePermissionDto dto);

    Task<bool> DeleteAsync(int id);

    // Get all effective permissions of a user
    Task<List<PermissionResponseDto>> GetPermissionsByUserIdAsync(int userId);
}