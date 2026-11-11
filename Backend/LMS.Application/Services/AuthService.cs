
using LMS.Application.DTO.Auth;

using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace LMS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(
        IAuthRepository authRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IConfiguration configuration)
    {
        _authRepository = authRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<AuthResponseDto> RegisterAsync(
        RegisterRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new Exception("Full name is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new Exception("Email is required.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new Exception("Password is required.");

        if (request.Password != request.ConfirmPassword)
            throw new Exception("Passwords do not match.");

        if (request.Password.Length < 8)
            throw new Exception("Password must contain at least 8 characters.");

        var email = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _authRepository
            .GetUserByEmailAsync(email);

        if (existingUser != null)
            throw new Exception("Email is already registered.");

        var roleKey = _configuration[
            "Authentication:DefaultRegistrationRoleKey"];

        if (string.IsNullOrWhiteSpace(roleKey))
            throw new Exception("Default registration role is not configured.");

        var role = await _authRepository.GetRoleByKeyAsync(roleKey);

        if (role == null)
            throw new Exception("Default registration role was not found.");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber?.Trim(),
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        await _authRepository.AddUserAsync(user);
        await _authRepository.SaveChangesAsync();

        user.Role = role;

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(
        LoginRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _authRepository.GetUserByEmailAsync(email);

        if (user == null)
            throw new Exception("Invalid email or password.");

        if (!user.IsActive)
            throw new Exception("Your account is inactive.");

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
            throw new Exception("Invalid email or password.");

        return CreateAuthResponse(user);
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var token = _jwtTokenGenerator.GenerateToken(user);

        var expiryMinutes = Convert.ToDouble(
            _configuration["Jwt:ExpiryMinutes"] ?? "60");

        return new AuthResponseDto
        {
            Token = token,
            ExpiryAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            RoleId = user.RoleId,
            //RoleName = user.Role.Name
        };
    }
}
