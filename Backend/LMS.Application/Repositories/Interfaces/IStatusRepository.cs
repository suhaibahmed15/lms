using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces
{
    public interface IStatusRepository
    {
        Task<List<Status>> GetAllAsync();

        Task<Status?> GetByIdAsync(int id);

        Task<bool> ExistsByKeyAsync(
            string key,
            int? excludeStatuId = null
            );

        Task AddAsync(Status status);

        Task UpdateAsync(Status status);

        Task SaveChangesAsync();

    }
}
