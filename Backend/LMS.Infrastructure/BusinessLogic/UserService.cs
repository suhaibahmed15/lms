
using LMS.Application.DTO.Users;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace LMS.Infrastructure.BusinessLogic;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserService(
        IUserRepository userRepository,
        IPasswordHasher<User> passwordHasher,
        IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _httpContextAccessor = httpContextAccessor;
    }

    // Get all users.
    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(MapToResponse).ToList();
    }

    public async Task<object> GetPagedAsync()
    {
        var query = _httpContextAccessor.HttpContext?.Request.Query;

        var pageNumber = int.TryParse(query?["pageNumber"], out var p) && p > 0 ? p : 1;
        var pageSize = int.TryParse(query?["pageSize"], out var s) && s > 0 ? Math.Min(s, 100) : 10;
        var search = query?["search"].ToString();
        var sortBy = query?["sortBy"].ToString();
        var sortDirection = string.Equals(query?["sortDirection"].ToString(), "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
        int? roleId = int.TryParse(query?["roleId"], out var rId) ? rId : null;
        bool? isActive = bool.TryParse(query?["isActive"], out var active) ? active : null;

        var (users, totalRecords, activeCount, inactiveCount) = await _userRepository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, roleId, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "Users retrieved successfully.",
            data = users.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages,
            activeCount,
            inactiveCount
        };
    }

    // Get user by ID.
    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            return null;

        return MapToResponse(user);
    }

    // Create a new user.
    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto)
    {
        var fullName = dto.FullName.Trim();
        //var lastName = dto.LastName.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("First name is required.");

      

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("Password is required.");

        if (dto.Password.Length < 8)
            throw new ArgumentException(
                "Password must contain at least 8 characters.");

        if (await _userRepository.ExistsByEmailAsync(email))
            throw new InvalidOperationException(
                "Email already exists.");

        if (!await _userRepository.RoleExistsAsync(dto.RoleId))
            throw new ArgumentException("Invalid or inactive role.");

        var user = new User
        {
            FullName = fullName,
            Email = email,
            PhoneNumber = dto.PhoneNumber?.Trim(),
            RoleId = dto.RoleId,
            IsActive = true
        };

        // Hash password instead of saving plain text.
        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            dto.Password);

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var savedUser = await _userRepository.GetByIdAsync(user.Id);
        return MapToResponse(savedUser ?? user);
    }

    // Update an existing user (Partial Update).
    public async Task<UserResponseDto?> UpdateAsync(
        int id,
        UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            return null;

        // At least one property must be provided.
        if (dto.FullName == null &&
            dto.Email == null &&
            dto.PhoneNumber == null &&
            dto.RoleId == null)
        {
            throw new ArgumentException(
                "Provide at least one field to update.");
        }

        // Update FullName only if provided.
        if (dto.FullName != null)
        {
            var fullName = dto.FullName.Trim();

            if (string.IsNullOrWhiteSpace(fullName))
                throw new ArgumentException(
                    "First name cannot be empty.");

            user.FullName = fullName;
        }

       
      

        // Update Email only if provided.
        if (dto.Email != null)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException(
                    "Email cannot be empty.");

            if (await _userRepository.ExistsByEmailAsync(email, id))
                throw new InvalidOperationException(
                    "Email already exists.");

            user.Email = email;
        }

        // Update PhoneNumber only if provided.
        if (dto.PhoneNumber != null)
        {
            user.PhoneNumber = dto.PhoneNumber.Trim();
        }

        // Update RoleId only if provided.
        if (dto.RoleId.HasValue)
        {
            if (!await _userRepository.RoleExistsAsync(dto.RoleId.Value))
                throw new ArgumentException(
                    "Invalid or inactive role.");

            user.RoleId = dto.RoleId.Value;
        }

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return MapToResponse(user);
    }

    // Activate or deactivate a user.
    public async Task<bool?> ChangeStatusAsync(
        int id,
        bool isActive)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            return null;

        user.IsActive = isActive;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return true;
    }

    // Soft delete a user.
    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
            return false;

        user.IsDeleted = true;
        user.IsActive = false;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return true;
    }

    // Convert User entity into response DTO.
    private static UserResponseDto MapToResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            RoleId = user.RoleId,
            RoleName = user.Role?.Name,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
