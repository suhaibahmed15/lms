
using LMS.Application.DTO.Roles;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace LMS.Infrastructure.BusinessLogic;

public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RoleService(
        IRoleRepository roleRepository,
        IHttpContextAccessor httpContextAccessor)
    {
        _roleRepository = roleRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    // Get all roles.
    public async Task<List<RoleResponseDto>> GetAllAsync()
    {
        var roles = await _roleRepository.GetAllAsync();

        return roles.Select(MapToResponse).ToList();
    }

    public async Task<object> GetPagedAsync()
    {
        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 10;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
        bool? isActive = bool.TryParse(query?["isActive"], out var active) ? active : null;

        var (roles, totalRecords, activeCount, inactiveCount) = await _roleRepository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "Roles retrieved successfully.",
            data = roles.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages,
            activeCount,
            inactiveCount
        };
    }

    // Get role by ID.
    public async Task<RoleResponseDto?> GetByIdAsync(int id)
    {
        var role = await _roleRepository.GetByIdAsync(id);

        if (role == null)
            return null;

        return MapToResponse(role);
    }

    // Get current user's assigned role.
    public async Task<RoleResponseDto?> GetMyRoleAsync(int userId)
    {
        var role = await _roleRepository.GetRoleByUserIdAsync(userId);

        if (role == null)
            return null;

        return MapToResponse(role);
    }

    // Create a new role.
    public async Task<RoleResponseDto> CreateAsync(CreateRoleDto dto)
    {
        var name = dto.Name.Trim();
        var key = dto.Key.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Role name is required.");

        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Role key is required.");

        if (await _roleRepository.ExistsByNameAsync(name))
            throw new InvalidOperationException("Role name already exists.");

        if (await _roleRepository.ExistsByKeyAsync(key))
            throw new InvalidOperationException("Role key already exists.");

        var role = new Role
        {
            Name = name,
            Key = key,
            Description = dto.Description?.Trim(),
            IsActive = true
        };

        await _roleRepository.AddAsync(role);
        await _roleRepository.SaveChangesAsync();

        return MapToResponse(role);
    }

    // Update an existing role.
    public async Task<RoleResponseDto?> UpdateAsync(
        int id,
        UpdateRoleDto dto)
    {
        var role = await _roleRepository.GetByIdAsync(id);

        if (role == null)
            return null;

        if (dto.Name != null)
        {
            var name = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Role name cannot be empty.");

            if (await _roleRepository.ExistsByNameAsync(name, id))
                throw new InvalidOperationException(
                    "Role name already exists.");

            role.Name = name;
        }

        if (dto.Key != null)
        {
            var key = dto.Key.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Role key cannot be empty.");

            if (await _roleRepository.ExistsByKeyAsync(key, id))
                throw new InvalidOperationException(
                    "Role key already exists.");

            role.Key = key;
        }

        if (dto.Description != null)
        {
            role.Description = dto.Description.Trim();
        }

        if (dto.IsActive.HasValue)
        {
            role.IsActive = dto.IsActive.Value;
        }

        await _roleRepository.UpdateAsync(role);
        await _roleRepository.SaveChangesAsync();

        return MapToResponse(role);
    }

    // Soft delete a role.
    public async Task<bool> DeleteAsync(int id)
    {
        var role = await _roleRepository.GetByIdAsync(id);

        if (role == null)
            return false;

        if (await _roleRepository.HasAssignedUsersAsync(id))
            throw new InvalidOperationException(
                "Cannot delete a role assigned to users.");

        if (await _roleRepository.HasAssignedPermissionsAsync(id))
            throw new InvalidOperationException(
                "Cannot delete a role with assigned permissions.");

        if (await _roleRepository.HasAssignedMenusAsync(id))
            throw new InvalidOperationException(
                "Cannot delete a role with assigned menus.");

        role.IsDeleted = true;
        role.IsActive = false;

        await _roleRepository.UpdateAsync(role);
        await _roleRepository.SaveChangesAsync();

        return true;
    }

    // Activate or deactivate a role.
    public async Task<bool?> ChangeStatusAsync(int id, bool isActive)
    {
        var role = await _roleRepository.GetByIdAsync(id);

        if (role == null)
            return null;

        role.IsActive = isActive;

        await _roleRepository.UpdateAsync(role);
        await _roleRepository.SaveChangesAsync();

        return true;
    }

    // Convert Role entity into response DTO.
    private static RoleResponseDto MapToResponse(Role role)
    {
        return new RoleResponseDto
        {
            Id = role.Id,
            Name = role.Name,
            Key = role.Key,
            Description = role.Description,
            IsActive = role.IsActive,
            CreatedAt = role.CreatedAt,
            UpdatedAt = role.UpdatedAt
        };
    }
}
