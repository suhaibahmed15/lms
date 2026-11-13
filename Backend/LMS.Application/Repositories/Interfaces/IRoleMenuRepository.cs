using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface IRoleMenuRepository
{
    Task<bool> RoleExistsAsync(int roleId);
    Task<bool> MenuExistsAsync(int menuId);
    Task<bool> AssignmentExistsAsync(int roleId, int menuId);

    Task<List<RoleMenu>> GetAllAsync();
    Task<List<RoleMenu>> GetMenusByRoleIdAsync(int roleId);
    Task<RoleMenu?> GetByIdAsync(int id);

    Task AddAsync(RoleMenu roleMenu);
    Task SaveChangesAsync();
}