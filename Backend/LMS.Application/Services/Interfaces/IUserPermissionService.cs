
using LMS.Application.DTO.UserPermissions;

namespace LMS.Application.Services.Interfaces;

public interface IUserPermissionService
{
    Task<UserPermissionResponseDto> AssignPermissionAsync(CreateUserPermissionDto dto);

    Task<List<UserPermissionResponseDto>> GetAllAsync();

    Task<List<UserPermissionResponseDto>> GetByUserIdAsync(int userId);

    Task RevokePermissionAsync(int id, int revokedByUserId);
}
