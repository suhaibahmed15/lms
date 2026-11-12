using LMS.Application.Repositories.Interfaces;

using LMS.Domain.Entities;

using LMS.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class StatusRepository : IStatusRepository
{

    private readonly ApplicationDbContext _context;

    public StatusRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Status>> GetAllAsync()
    {


        return await _context.Statuses
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .ToListAsync();
    }

    public async Task<Status?> GetByIdAsync(int id)
    {
        return await _context.Statuses
          .FirstOrDefaultAsync(s =>
          s.Id == id && !s.IsDeleted);
    }


    public async Task<bool> ExistsByKeyAsync(
        string key,
        int? excludeStatusId = null)
    {
        return await _context.Statuses.AnyAsync(s =>
            !s.IsDeleted &&
            s.Key == key &&
            (excludeStatusId == null ||
             s.Id != excludeStatusId.Value));
    }

    public async Task AddAsync(Status status)
    {
        await _context.Statuses.AddAsync(status);
    }

    public Task UpdateAsync(Status status)
    {


        _context.Statuses.Update(status);

        return Task.CompletedTask;
    }


    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

}