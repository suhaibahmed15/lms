using LMS.Application.DTO.RolePermissions;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace LMS.Infrastructure.BusinessLogic;

public class RolePermissionService : IRolePermissionService
{
    private readonly IRolePermissionRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RolePermissionService(
        IRolePermissionRepository repository,
        IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<bool> AssignPermissionAsync(
        CreateRolePermissionDto dto)
    {
        if (!await _repository.RoleExistsAsync(dto.RoleId))
            throw new InvalidOperationException("Role not found or inactive.");

        if (!await _repository.PermissionExistsAsync(dto.PermissionId))
            throw new InvalidOperationException("Permission not found or inactive.");

        if (await _repository.AssignmentExistsAsync(
            dto.RoleId, dto.PermissionId))
        {
            throw new InvalidOperationException(
                "This permission is already assigned to this role.");
        }

        var existing = await _repository.GetExistingAssignmentAsync(dto.RoleId, dto.PermissionId);
        if (existing != null)
        {
            existing.IsDeleted = false;
            await _repository.SaveChangesAsync();
            return true;
        }

        var rolePermission = new RolePermission
        {
            RoleId = dto.RoleId,
            PermissionId = dto.PermissionId,
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

    public async Task<object> GetPagedAsync()
    {
        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 10;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
        int? roleId = int.TryParse(query?["roleId"], out var rId) ? rId : null;
        int? permissionId = int.TryParse(query?["permissionId"], out var permId) ? permId : null;
        bool? isActive = bool.TryParse(query?["isActive"], out var active) ? active : null;

        var (items, totalRecords) = await _repository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, roleId, permissionId, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "Role permissions retrieved successfully.",
            data = items.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages
        };
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