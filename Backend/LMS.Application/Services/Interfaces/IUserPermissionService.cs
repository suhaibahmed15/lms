
using LMS.Application.DTO.UserPermissions;

namespace LMS.Application.Services.Interfaces;

public interface IUserPermissionService
{
    Task<UserPermissionResponseDto> AssignPermissionAsync(CreateUserPermissionDto dto, int? actorUserId = null);

    Task<List<UserPermissionResponseDto>> GetAllAsync();

    Task<object> GetPagedAsync();

    Task<List<UserPermissionResponseDto>> GetByUserIdAsync(int userId, bool activeOnly = true);

    Task RevokePermissionAsync(int id, int revokedByUserId);
}
