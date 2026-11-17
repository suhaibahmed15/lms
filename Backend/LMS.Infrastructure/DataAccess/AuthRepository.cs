
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class AuthRepository : IAuthRepository
{
    private readonly ApplicationDbContext _context;

    public AuthRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get user by email with role information
    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Email == email &&
                !u.IsDeleted);
    }

    // Get active role by role key
    public async Task<Role?> GetRoleByKeyAsync(string roleKey)
    {
        return await _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r =>
                r.Key == roleKey &&
                r.IsActive &&
                !r.IsDeleted);
    }

    // Add new user
    public async Task AddUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    // Save changes
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
