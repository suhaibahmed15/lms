
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IPermissionRepository
{
    Task<List<Permission>> GetAllAsync();

    Task<(List<Permission> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive,
        int? menuId);

    Task<Permission?> GetByIdAsync(int id);

    Task<bool> KeyExistsAsync(string key, int? excludeId = null);

    Task<List<Permission>> GetPermissionsByUserIdAsync(int userId);

    Task AddAsync(Permission permission);

    Task SaveChangesAsync();
}
