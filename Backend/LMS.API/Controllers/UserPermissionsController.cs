
using LMS.Application.DTO.UserPermissions;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserPermissionsController : ControllerBase
{
    private readonly IUserPermissionService _service;

    public UserPermissionsController(IUserPermissionService service)
    {
        _service = service;
    }

    // Assign permission to a user
    [HttpPost]
    public async Task<IActionResult> AssignPermission(
        [FromBody] CreateUserPermissionDto dto)
    {
        try
        {
            var result = await _service.AssignPermissionAsync(dto);

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
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();

        return Ok(result);
    }

    // Get permissions assigned to a specific user
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        try
        {
            var result = await _service.GetByUserIdAsync(userId);

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
    public async Task<IActionResult> RevokePermission(
        int id,
        [FromQuery] int revokedByUserId)
    {
        try
        {
            await _service.RevokePermissionAsync(id, revokedByUserId);

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
