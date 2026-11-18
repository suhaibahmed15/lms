
using LMS.Application.DTO.UserPermissions;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace LMS.Infrastructure.BusinessLogic;

public class UserPermissionService : IUserPermissionService
{
    private readonly IUserPermissionRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserPermissionService(
        IUserPermissionRepository repository,
        IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    // Assign permission to a user
    public async Task<UserPermissionResponseDto> AssignPermissionAsync(
        CreateUserPermissionDto dto,
        int? actorUserId = null)
    {
        // Check whether user exists and is active
        if (!await _repository.UserExistsAsync(dto.UserId))
            throw new Exception("User not found or inactive.");

        // Check whether permission exists
        if (!await _repository.PermissionExistsAsync(dto.PermissionId))
            throw new Exception("Permission not found.");

        // Check whether permission is active
        if (!await _repository.PermissionIsActiveAsync(dto.PermissionId))
            throw new Exception("This permission is inactive.");

        var effectiveAssignedByUserId = actorUserId ?? dto.AssignedByUserId;

        // Check whether assigning user exists, if provided
        if (effectiveAssignedByUserId.HasValue)
        {
            if (!await _repository.UserExistsAsync(effectiveAssignedByUserId.Value))
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

        // If this permission was previously revoked for this user, reactivate the latest record
        // and clean up any older duplicate revoked rows to prevent stale records.
        var revokedAssignments = await _repository.GetRevokedAssignmentsAsync(
            dto.UserId, dto.PermissionId);

        if (revokedAssignments.Count > 0)
        {
            var latestRevoked = revokedAssignments[0];
            latestRevoked.IsActive = true;
            latestRevoked.AssignedByUserId = effectiveAssignedByUserId;
            latestRevoked.AssignedAt = currentDate;
            latestRevoked.RevokedByUserId = null;
            latestRevoked.RevokedAt = null;
            latestRevoked.UpdatedAt = currentDate;
            latestRevoked.UpdatedBy = effectiveAssignedByUserId;

            _repository.Update(latestRevoked);

            for (var i = 1; i < revokedAssignments.Count; i++)
            {
                revokedAssignments[i].IsDeleted = true;
                revokedAssignments[i].UpdatedAt = currentDate;
                revokedAssignments[i].UpdatedBy = effectiveAssignedByUserId;
                _repository.Update(revokedAssignments[i]);
            }

            await _repository.SaveChangesAsync();

            var reactivated = await _repository.GetByIdAsync(latestRevoked.Id);
            return MapToResponse(reactivated!);
        }

        // Create new user permission assignment
        var userPermission = new UserPermission
        {
            UserId = dto.UserId,
            PermissionId = dto.PermissionId,
            AssignedByUserId = effectiveAssignedByUserId,
            AssignedAt = currentDate,
            IsActive = true,
            CreatedAt = currentDate,
            CreatedBy = effectiveAssignedByUserId,
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

    public async Task<object> GetPagedAsync()
    {
        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 10;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
        int? userId = int.TryParse(query?["userId"], out var uId) ? uId : null;
        int? permissionId = int.TryParse(query?["permissionId"], out var permId) ? permId : null;
        bool? isActive = bool.TryParse(query?["isActive"], out var active) ? active : null;

        var (items, totalRecords, activeCount, revokedCount) = await _repository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, userId, permissionId, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "User permissions retrieved successfully.",
            data = items.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages,
            activeCount,
            revokedCount
        };
    }

    // Get permissions assigned to a specific user
    public async Task<List<UserPermissionResponseDto>> GetByUserIdAsync(
        int userId,
        bool activeOnly = true)
    {
        if (!await _repository.UserExistsAsync(userId))
            throw new Exception("User not found.");

        var permissions = await _repository.GetByUserIdAsync(userId, activeOnly);

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
