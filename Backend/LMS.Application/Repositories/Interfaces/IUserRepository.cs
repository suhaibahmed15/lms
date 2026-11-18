
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();

    Task<(List<User> Items, int TotalRecords, int ActiveCount, int InactiveCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        int? roleId,
        bool? isActive);

    Task<User?> GetByIdAsync(int id);

    Task<bool> ExistsByEmailAsync(
        string email,
        int? excludeUserId = null);

    Task<bool> RoleExistsAsync(int roleId);

    Task AddAsync(User user);

    Task UpdateAsync(User user);

    Task SaveChangesAsync();
}
