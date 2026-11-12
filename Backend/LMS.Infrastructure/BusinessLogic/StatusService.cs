
using LMS.Application.DTO.Statuses;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class StatusService : IStatusService
{
    private readonly IStatusRepository _statusRepository;

    public StatusService(IStatusRepository statusRepository)
    {
        _statusRepository = statusRepository;
    }

    // Get all statuses.
    public async Task<List<StatusResponseDto>> GetAllAsync()
    {
        var statuses = await _statusRepository.GetAllAsync();

        return statuses.Select(MapToResponse).ToList();
    }

    // Get status by ID.
    public async Task<StatusResponseDto?> GetByIdAsync(int id)
    {
        var status = await _statusRepository.GetByIdAsync(id);

        if (status == null)
            return null;

        return MapToResponse(status);
    }

    // Create a new status.
    public async Task<StatusResponseDto> CreateAsync(
        CreateStatusDto dto)
    {
        var category = dto.Category.Trim();
        var name = dto.Name.Trim();
        var key = dto.Key.Trim();

        if (string.IsNullOrWhiteSpace(category))
            throw new ArgumentException("Category is required.");

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Status name is required.");

        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Status key is required.");

        if (dto.SortOrder < 0)
            throw new ArgumentException(
                "Sort order cannot be negative.");

        if (await _statusRepository.ExistsByKeyAsync(key))
            throw new InvalidOperationException(
                "Status key already exists.");

        var status = new Status
        {
            Category = category,
            Name = name,
            Key = key,
            Description = dto.Description?.Trim(),
            SortOrder = dto.SortOrder,
            IsActive = true
        };

        await _statusRepository.AddAsync(status);
        await _statusRepository.SaveChangesAsync();

        return MapToResponse(status);
    }

    // Update an existing status (Partial Update).
    public async Task<StatusResponseDto?> UpdateAsync(
        int id,
        UpdateStatusDto dto)
    {
        var status = await _statusRepository.GetByIdAsync(id);

        if (status == null)
            return null;

        // At least one property must be provided.
        if (dto.Category == null &&
            dto.Name == null &&
            dto.Key == null &&
            dto.Description == null &&
            dto.SortOrder == null)
        {
            throw new ArgumentException(
                "Provide at least one field to update.");
        }

        // Update Category only if provided.
        if (dto.Category != null)
        {
            var category = dto.Category.Trim();

            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException(
                    "Category cannot be empty.");

            status.Category = category;
        }

        // Update Name only if provided.
        if (dto.Name != null)
        {
            var name = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException(
                    "Status name cannot be empty.");

            status.Name = name;
        }

        // Update Key only if provided.
        if (dto.Key != null)
        {
            var key = dto.Key.Trim();

            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException(
                    "Status key cannot be empty.");

            if (await _statusRepository.ExistsByKeyAsync(key, id))
                throw new InvalidOperationException(
                    "Status key already exists.");

            status.Key = key;
        }

        // Update Description only if provided.
        if (dto.Description != null)
        {
            status.Description = dto.Description.Trim();
        }

        // Update SortOrder only if provided.
        if (dto.SortOrder.HasValue)
        {
            if (dto.SortOrder.Value < 0)
                throw new ArgumentException(
                    "Sort order cannot be negative.");

            status.SortOrder = dto.SortOrder.Value;
        }

        await _statusRepository.UpdateAsync(status);
        await _statusRepository.SaveChangesAsync();

        return MapToResponse(status);
    }

    // Activate or deactivate a status.
    public async Task<bool?> ChangeStatusAsync(
        int id,
        bool isActive)
    {
        var status = await _statusRepository.GetByIdAsync(id);

        if (status == null)
            return null;

        status.IsActive = isActive;

        await _statusRepository.UpdateAsync(status);
        await _statusRepository.SaveChangesAsync();

        return true;
    }

    // Soft delete a status.
    public async Task<bool> DeleteAsync(int id)
    {
        var status = await _statusRepository.GetByIdAsync(id);

        if (status == null)
            return false;

        status.IsDeleted = true;
        status.IsActive = false;

        await _statusRepository.UpdateAsync(status);
        await _statusRepository.SaveChangesAsync();

        return true;
    }

    // Convert Status entity into response DTO.
    private static StatusResponseDto MapToResponse(Status status)
    {
        return new StatusResponseDto
        {
            Id = status.Id,
            Category = status.Category,
            Name = status.Name,
            Key = status.Key,
            Description = status.Description,
            SortOrder = status.SortOrder,
            IsActive = status.IsActive
        };
    }
}
