
using System.Security.Claims;
using LMS.Application.DTO.Roles;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    // GET: api/roles/my-role
    // An authenticated user can only see their own role.
    [HttpGet("my-role")]
    public async Task<IActionResult> GetMyRole()
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out int userId))
        {
            return Unauthorized(new
            {
                message = "Unable to identify the authenticated user."
            });
        }

        var role = await _roleService.GetMyRoleAsync(userId);

        if (role == null)
        {
            return NotFound(new
            {
                message = "Your assigned role was not found."
            });
        }

        return Ok(new
        {
            message = "Your role retrieved successfully.",
            data = new
            {
                id = role.Id,
                name = role.Name,
                key = role.Key
            }
        });
    }

    // GET: api/roles
    [Authorize(Policy = "Permission:ROLE_VIEW")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _roleService.GetPagedAsync();

        return Ok(result);
    }

    // GET: api/roles/{id}
    [Authorize(Policy = "Permission:ROLE_VIEW")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var role = await _roleService.GetByIdAsync(id);

        if (role == null)
        {
            return NotFound(new
            {
                message = "Role not found."
            });
        }

        return Ok(new
        {
            message = "Role retrieved successfully.",
            data = role
        });
    }

    // POST: api/roles
    [Authorize(Policy = "Permission:ROLE_MANAGE")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateRoleDto request)
    {
        try
        {
            var createdRole = await _roleService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdRole.Id },
                new
                {
                    message = "Role created successfully.",
                    data = createdRole
                });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // PUT: api/roles/{id}
    [Authorize(Policy = "Permission:ROLE_MANAGE")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateRoleDto request)
    {
        try
        {
            var updatedRole = await _roleService.UpdateAsync(id, request);

            if (updatedRole == null)
            {
                return NotFound(new
                {
                    message = "Role not found."
                });
            }

            return Ok(new
            {
                message = "Role updated successfully.",
                data = updatedRole
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // DELETE: api/roles/{id}
    // Only Admin or users with ROLE_DELETE permission can delete roles.
    [Authorize(Policy = "Permission:ROLE_DELETE")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _roleService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Role not found."
                });
            }

            return Ok(new
            {
                message = "Role deleted successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
