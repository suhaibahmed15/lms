
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get all users.
    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.Id)
            .ToListAsync();
    }

    // Get user by ID.
    // Keep the entity tracked for updates.
    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
    }

    // Check whether email already exists.
    public async Task<bool> ExistsByEmailAsync(
        string email,
        int? excludeUserId = null)
    {
        return await _context.Users.AnyAsync(u =>
            !u.IsDeleted &&
            u.Email == email &&
            (excludeUserId == null || u.Id != excludeUserId.Value));
    }

    // Check whether the selected role exists and is active.
    public async Task<bool> RoleExistsAsync(int roleId)
    {
        return await _context.Roles.AnyAsync(r =>
            r.Id == roleId &&
            r.IsActive &&
            !r.IsDeleted);
    }

    // Add a new user.
    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    // Update an existing user.
    public Task UpdateAsync(User user)
    {
        _context.Users.Update(user);

        return Task.CompletedTask;
    }

    // Save database changes.
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
