using LMS.Application.DTO.RolePermissions;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class RolePermissionService : IRolePermissionService
{
    private readonly IRolePermissionRepository _repository;

    public RolePermissionService(IRolePermissionRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> AssignPermissionAsync(
        CreateRolePermissionDto dto)
    {
        if (!await _repository.RoleExistsAsync(dto.RoleId))
            throw new InvalidOperationException("Role not found.");

        if (!await _repository.PermissionExistsAsync(dto.PermissionId))
            throw new InvalidOperationException("Permission not found.");

        if (await _repository.AssignmentExistsAsync(
            dto.RoleId, dto.PermissionId))
        {
            throw new InvalidOperationException(
                "This permission is already assigned to this role.");
        }

        var rolePermission = new RolePermission
        {
            RoleId = dto.RoleId,
            PermissionId = dto.PermissionId,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        await _repository.AddAsync(rolePermission);
        await _repository.SaveChangesAsync();

        return true;
    }

    public async Task<List<RolePermissionResponseDto>> GetAllAsync()
    {
        var assignments = await _repository.GetAllAsync();

        return assignments.Select(MapToResponse).ToList();
    }

    public async Task<List<RolePermissionResponseDto>> GetByRoleIdAsync(
        int roleId)
    {
        if (!await _repository.RoleExistsAsync(roleId))
            throw new InvalidOperationException("Role not found.");

        var assignments = await _repository.GetByRoleIdAsync(roleId);

        return assignments.Select(MapToResponse).ToList();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rolePermission = await _repository.GetByIdAsync(id);

        if (rolePermission == null)
            return false;

        rolePermission.IsDeleted = true;
        rolePermission.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();

        return true;
    }

    private static RolePermissionResponseDto MapToResponse(
        RolePermission rp)
    {
        return new RolePermissionResponseDto
        {
            Id = rp.Id,
            RoleId = rp.RoleId,
            PermissionId = rp.PermissionId,

            PermissionName = rp.Permission.Name,
            PermissionKey = rp.Permission.Key,
            Description = rp.Permission.Description,
            IsActive = rp.Permission.IsActive,

            CreatedAt = rp.CreatedAt,
            UpdatedAt = rp.UpdatedAt
        };
    }
}