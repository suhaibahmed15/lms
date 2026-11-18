using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces
{
    public interface IStatusRepository
    {
        Task<List<Status>> GetAllAsync();

        Task<(List<Status> Items, int TotalRecords)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            string? sortBy,
            string? sortDirection,
            string? category,
            bool? isActive);

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
