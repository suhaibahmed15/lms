
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IUserMenuRepository
{
    Task<List<UserMenu>> GetAllAsync();

    Task<(List<UserMenu> Items, int TotalRecords)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? userId,
        int? menuId,
        bool? isActive);

    Task<List<UserMenu>> GetByUserIdAsync(int userId);

    Task<(List<UserMenu> Items, int TotalRecords)> GetPagedByUserIdAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection);

    Task<UserMenu?> GetByIdAsync(int id);

    Task<bool> UserExistsAsync(int userId);

    Task<bool> MenuExistsAsync(int menuId);
    Task<UserMenu?> GetExistingAssignmentAsync(int userId, int menuId);

    Task<bool> AssignmentExistsAsync(int userId, int menuId);

    Task AddAsync(UserMenu userMenu);

    Task SaveChangesAsync();


}
