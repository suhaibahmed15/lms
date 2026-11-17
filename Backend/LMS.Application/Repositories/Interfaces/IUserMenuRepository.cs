
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IUserMenuRepository
{
    Task<List<UserMenu>> GetAllAsync();

    Task<List<UserMenu>> GetByUserIdAsync(int userId);

    Task<UserMenu?> GetByIdAsync(int id);

    Task<bool> UserExistsAsync(int userId);

    Task<bool> MenuExistsAsync(int menuId);
    Task<UserMenu?> GetExistingAssignmentAsync(int userId, int menuId);

    Task<bool> AssignmentExistsAsync(int userId, int menuId);

    Task AddAsync(UserMenu userMenu);

    Task SaveChangesAsync();


}
