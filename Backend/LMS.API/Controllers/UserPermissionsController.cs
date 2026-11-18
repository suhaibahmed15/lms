
using LMS.Application.DTO.UserPermissions;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserPermissionsController : ControllerBase
{
    private readonly IUserPermissionService _service;
    private readonly IAuthorizationService _authorizationService;

    public UserPermissionsController(
        IUserPermissionService service,
        IAuthorizationService authorizationService)
    {
        _service = service;
        _authorizationService = authorizationService;
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(value, out var userId) && userId > 0
            ? userId
            : null;
    }

    // Assign permission to a user
    [HttpPost]
    [Authorize(Policy = "Permission:PERMISSION_MANAGE")]
    public async Task<IActionResult> AssignPermission(
        [FromBody] CreateUserPermissionDto dto)
    {
        var actorUserId = GetCurrentUserId();
        if (!actorUserId.HasValue)
        {
            return Unauthorized(new { success = false, message = "Invalid user token." });
        }

        try
        {
            var result = await _service.AssignPermissionAsync(dto, actorUserId.Value);

            return Ok(new
            {
                success = true,
                message = "Permission assigned successfully.",
                data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    // Get all user permission assignments
    [HttpGet]
    [Authorize(Policy = "Permission:USER_PERMISSION_VIEW")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetPagedAsync();

        return Ok(result);
    }

    // Get permissions assigned to a specific user
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(
        int userId,
        [FromQuery] bool activeOnly = true)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
        {
            return Unauthorized(new { success = false, message = "Invalid user token." });
        }

        if (currentUserId.Value != userId)
        {
            var authResult = await _authorizationService.AuthorizeAsync(
                User, null, "Permission:PERMISSION_MANAGE");

            if (!authResult.Succeeded)
            {
                return Forbid();
            }
        }

        try
        {
            var result = await _service.GetByUserIdAsync(userId, activeOnly);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    // Revoke an assigned permission
    [HttpPost("{id}/revoke")]
    [Authorize(Policy = "Permission:PERMISSION_MANAGE")]
    public async Task<IActionResult> RevokePermission(
        int id,
        [FromQuery] int? revokedByUserId = null)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
        {
            return Unauthorized(new { success = false, message = "Invalid user token." });
        }

        try
        {
            // Always use authenticated user ID from JWT rather than trusting client-supplied ID
            await _service.RevokePermissionAsync(id, currentUserId.Value);

            return Ok(new
            {
                success = true,
                message = "Permission revoked successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
}
