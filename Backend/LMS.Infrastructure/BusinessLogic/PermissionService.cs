
using LMS.Application.DTO.Permissions;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class PermissionService : IPermissionService
{
    private readonly IPermissionRepository _repository;

    public PermissionService(IPermissionRepository repository)
    {
        _repository = repository;
    }

    public async Task<PermissionResponseDto> CreateAsync(CreatePermissionDto dto)
    {
        string name = dto.Name.Trim();
        string key = dto.Key.Trim();

        if (await _repository.KeyExistsAsync(key))
        {
            throw new InvalidOperationException("Permission key already exists.");
        }

        var permission = new Permission
        {
            Name = name,
            Key = key,
            Description = dto.Description?.Trim(),
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(permission);
        await _repository.SaveChangesAsync();

        return MapToResponse(permission);
    }

    public async Task<List<PermissionResponseDto>> GetAllAsync()
    {
        var permissions = await _repository.GetAllAsync();

        return permissions.Select(MapToResponse).ToList();
    }

    public async Task<PermissionResponseDto?> GetByIdAsync(int id)
    {
        var permission = await _repository.GetByIdAsync(id);

        if (permission == null)
            return null;

        return MapToResponse(permission);
    }

    public async Task<PermissionResponseDto?> UpdateAsync(
        int id,
        UpdatePermissionDto dto)
    {
        var permission = await _repository.GetByIdAsync(id);

        if (permission == null)
            return null;

        if (dto.Name != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new InvalidOperationException("Permission name cannot be empty.");

            permission.Name = dto.Name.Trim();
        }

        if (dto.Key != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Key))
                throw new InvalidOperationException("Permission key cannot be empty.");

            string key = dto.Key.Trim();

            if (await _repository.KeyExistsAsync(key, id))
                throw new InvalidOperationException("Permission key already exists.");

            permission.Key = key;
        }

        if (dto.Description != null)
        {
            permission.Description = dto.Description.Trim();
        }

        if (dto.IsActive.HasValue)
        {
            permission.IsActive = dto.IsActive.Value;
        }

        permission.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();

        return MapToResponse(permission);
    }
    public async Task<List<PermissionResponseDto>> GetPermissionsByUserIdAsync(int userId)
    {
        // Get effective permissions from repository
        var permissions = await _repository.GetPermissionsByUserIdAsync(userId);

        // Convert permissions into response DTOs
        return permissions.Select(MapToResponse).ToList();
    }
    public async Task<bool> DeleteAsync(int id)
    {
        var permission = await _repository.GetByIdAsync(id);

        if (permission == null)
            return false;

        permission.IsDeleted = true;
        permission.IsActive = false;
        permission.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveChangesAsync();

        return true;
    }

    private static PermissionResponseDto MapToResponse(Permission permission)
    {
        return new PermissionResponseDto
        {
            Id = permission.Id,
            Name = permission.Name,
            Key = permission.Key,
            Description = permission.Description,
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt
        };
    }
}
