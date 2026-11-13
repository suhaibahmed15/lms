
using LMS.Application.DTO.UserPermissions;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class UserPermissionService : IUserPermissionService
{
    private readonly IUserPermissionRepository _repository;

    public UserPermissionService(IUserPermissionRepository repository)
    {
        _repository = repository;
    }

    // Assign permission to a user
    public async Task<UserPermissionResponseDto> AssignPermissionAsync(
        CreateUserPermissionDto dto)
    {
        // Check whether user exists
        if (!await _repository.UserExistsAsync(dto.UserId))
            throw new Exception("User not found.");

        // Check whether permission exists
        if (!await _repository.PermissionExistsAsync(dto.PermissionId))
            throw new Exception("Permission not found.");

        // Check whether permission is active
        if (!await _repository.PermissionIsActiveAsync(dto.PermissionId))
            throw new Exception("This permission is inactive.");

        // Check whether assigning user exists, if provided
        if (dto.AssignedByUserId.HasValue)
        {
            if (!await _repository.UserExistsAsync(dto.AssignedByUserId.Value))
                throw new Exception("Assigned by user not found.");
        }

        // Check duplicate active assignment
        if (await _repository.AssignmentExistsAsync(
            dto.UserId, dto.PermissionId))
        {
            throw new Exception(
                "This permission is already assigned to this user.");
        }

        var currentDate = DateTime.UtcNow;

        // Self-assignment means AssignedByUserId will be NULL
        int? assignedByUserId =
    dto.UserId == dto.AssignedByUserId
        ? null
        : dto.AssignedByUserId;

        // Create new user permission assignment
        var userPermission = new UserPermission
        {
            UserId = dto.UserId,
            PermissionId = dto.PermissionId,
            AssignedByUserId = assignedByUserId,

            AssignedAt = currentDate,
            IsActive = true,
            CreatedAt = currentDate,
            CreatedBy = assignedByUserId,
            IsDeleted = false
        };

        await _repository.AddAsync(userPermission);
        await _repository.SaveChangesAsync();

        // Get saved assignment with related data
        var savedPermission =
            await _repository.GetByIdAsync(userPermission.Id);

        return MapToResponse(savedPermission!);
    }

    // Get all user permission assignments
    public async Task<List<UserPermissionResponseDto>> GetAllAsync()
    {
        var permissions = await _repository.GetAllAsync();

        return permissions.Select(MapToResponse).ToList();
    }

    // Get permissions assigned to a specific user
    public async Task<List<UserPermissionResponseDto>> GetByUserIdAsync(
        int userId)
    {
        if (!await _repository.UserExistsAsync(userId))
            throw new Exception("User not found.");

        var permissions = await _repository.GetByUserIdAsync(userId);

        return permissions.Select(MapToResponse).ToList();
    }

    // Revoke assigned permission
    public async Task RevokePermissionAsync(
        int id,
        int revokedByUserId)
    {
        var userPermission = await _repository.GetByIdAsync(id);

        if (userPermission == null)
            throw new Exception("User permission assignment not found.");

        if (!await _repository.UserExistsAsync(revokedByUserId))
            throw new Exception("Revoked by user not found.");

        if (!userPermission.IsActive)
            throw new Exception("This permission has already been revoked.");

        var currentDate = DateTime.UtcNow;

        // Preserve record and update revocation details
        userPermission.IsActive = false;
        userPermission.RevokedByUserId = revokedByUserId;
        userPermission.RevokedAt = currentDate;
        userPermission.UpdatedAt = currentDate;
        userPermission.UpdatedBy = revokedByUserId;

        _repository.Update(userPermission);

        await _repository.SaveChangesAsync();
    }

    // Convert entity into response DTO
    private static UserPermissionResponseDto MapToResponse(
        UserPermission entity)
    {
        return new UserPermissionResponseDto
        {
            Id = entity.Id,

            UserId = entity.UserId,
            FullName = entity.User.FullName,

            PermissionId = entity.PermissionId,
            PermissionName = entity.Permission.Name,
            PermissionKey = entity.Permission.Key,

            AssignedByUserId = entity.AssignedByUserId,
            AssignedAt = entity.AssignedAt,

            IsActive = entity.IsActive,

            RevokedByUserId = entity.RevokedByUserId,
            RevokedAt = entity.RevokedAt,

            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
