using LMS.Application.DTO.Roles;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    // GET: api/roles
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _roleService.GetAllAsync();

        return Ok(new
        {
            message = "Roles retrieved successfully.",
            data = roles
        });
    }

    // GET: api/roles/{id}
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
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleDto request)
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
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // PUT: api/roles/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoleDto request)
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
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // PATCH: api/roles/{id}/status
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeRoleStatusDto request)
    {
        var updated = await _roleService.ChangeStatusAsync(id, request.IsActive);

        if (updated == null)
        {
            return NotFound(new
            {
                message = "Role not found."
            });
        }

        return Ok(new
        {
            message = "Role status updated successfully."
        });
    }

    // DELETE: api/roles/{id}
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
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}

