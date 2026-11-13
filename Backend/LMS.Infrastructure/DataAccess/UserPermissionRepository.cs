
using LMS.Application.Repositories.Interfaces;
using LMS.Domain.Entities;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.DataAccess;

public class UserPermissionRepository : IUserPermissionRepository
{
    private readonly ApplicationDbContext _context;

    public UserPermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> UserExistsAsync(int userId)
    {
        return await _context.Users
            .AnyAsync(u => u.Id == userId && !u.IsDeleted);
    }

    public async Task<bool> PermissionExistsAsync(int permissionId)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Id == permissionId);
    }

    public async Task<bool> PermissionIsActiveAsync(int permissionId)
    {
        return await _context.Permissions
            .AnyAsync(p => p.Id == permissionId && p.IsActive);
    }

    public async Task<bool> AssignmentExistsAsync(int userId, int permissionId)
    {
        return await _context.UserPermissions
            .AnyAsync(x =>
                x.UserId == userId &&
                x.PermissionId == permissionId &&
                x.IsActive);
    }

    public async Task<List<UserPermission>> GetAllAsync()
    {
        return await _context.UserPermissions
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .OrderByDescending(x => x.Id)
            .ToListAsync();
    }

    public async Task<List<UserPermission>> GetByUserIdAsync(int userId)
    {
        return await _context.UserPermissions
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Id)
            .ToListAsync();
    }

    public async Task<UserPermission?> GetByIdAsync(int id)
    {
        return await _context.UserPermissions
            .Include(x => x.User)
            .Include(x => x.Permission)
            .Include(x => x.AssignedByUser)
            .Include(x => x.RevokedByUser)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(UserPermission userPermission)
    {
        await _context.UserPermissions.AddAsync(userPermission);
    }

    public void Update(UserPermission userPermission)
    {
        _context.UserPermissions.Update(userPermission);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
