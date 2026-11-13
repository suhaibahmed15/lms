using LMS.Application.DTO.RolePermissions;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolePermissionsController : ControllerBase
{
    private readonly IRolePermissionService _service;

    public RolePermissionsController(IRolePermissionService service)
    {
        _service = service;
    }

    // POST: api/RolePermissions
    // Assign permission to role
    [HttpPost]
    public async Task<IActionResult> AssignPermission(
        [FromBody] CreateRolePermissionDto dto)
    {
        try
        {
            await _service.AssignPermissionAsync(dto);

            return Ok(new
            {
                message = "Permission assigned to role successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/RolePermissions
    // Get all assignments
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();

        return Ok(result);
    }

    // GET: api/RolePermissions/role/1
    // Get permissions by role ID
    [HttpGet("role/{roleId}")]
    public async Task<IActionResult> GetByRoleId(int roleId)
    {
        try
        {
            var result = await _service.GetByRoleIdAsync(roleId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE: api/RolePermissions/1
    // Soft-delete assignment
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Role permission assignment not found."
            });
        }

        return Ok(new
        {
            message = "Permission assignment removed successfully."
        });
    }
}