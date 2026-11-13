using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IMenuRepository
{
    Task<List<Menu>> GetAllAsync();

    Task<Menu?> GetByIdAsync(int id);

    Task<bool> KeyExistsAsync(
        string key, 
        int? excludeId = null
        );

    Task<List<Menu>> GetMenusByUserIdAsync(int userId);
    Task<bool> ParentExistsAsync(int parentMenuId);

    Task<bool> HasChildrenAsync(int menuId);

    Task AddAsync(Menu menu);

    Task SaveChangesAsync();
}