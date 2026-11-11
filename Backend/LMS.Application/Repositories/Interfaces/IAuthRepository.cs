using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces
{
    public interface IAuthRepository
    {

        Task<User?> GetUserByEmailAsync(string email);

        Task<Role?> GetRoleByKeyAsync(string rolekey);

        Task AddUserAsync(User user);

        Task SaveChangesAsync();
    }
}
