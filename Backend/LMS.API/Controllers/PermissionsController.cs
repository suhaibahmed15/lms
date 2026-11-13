
using LMS.Application.DTO.Permissions;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    // POST: api/Permissions
    [HttpPost]
    public async Task<IActionResult> Create(CreatePermissionDto dto)
    {
        try
        {
            var result = await _permissionService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/Permissions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _permissionService.GetAllAsync();

        return Ok(result);
    }

    // GET: api/Permissions/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _permissionService.GetByIdAsync(id);

        if (result == null)
            return NotFound(new { message = "Permission not found." });

        return Ok(result);
    }

    // POST: api/Permissions/{id}
    [HttpPost("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdatePermissionDto dto)
    {
        try
        {
            var result = await _permissionService.UpdateAsync(id, dto);

            if (result == null)
                return NotFound(new { message = "Permission not found." });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }


    // GET: api/Permissions/user/1
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetPermissionsByUserId(int userId)
    {
        try
        {
            var permissions = await _permissionService.GetPermissionsByUserIdAsync(userId);

            return Ok(permissions);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE: api/Permissions/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _permissionService.DeleteAsync(id);

        if (!deleted)
            return NotFound(new { message = "Permission not found." });

        return Ok(new { message = "Permission deleted successfully." });
    }
}
