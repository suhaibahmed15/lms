using LMS.Application.DTO.RoleMenus;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleMenusController : ControllerBase
{
    private readonly IRoleMenuService _roleMenuService;

    public RoleMenusController(IRoleMenuService roleMenuService)
    {
        _roleMenuService = roleMenuService;
    }

    // POST: api/RoleMenus
    // Assign menu to role
    [HttpPost]
    public async Task<IActionResult> AssignMenu(
        [FromBody] CreateRoleMenuDto dto)
    {
        try
        {
            await _roleMenuService.AssignMenuAsync(dto);

            return Ok(new
            {
                message = "Menu assigned to role successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/RoleMenus
    // Get all role-menu assignments
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _roleMenuService.GetAllAsync();

        return Ok(result);
    }

    // GET: api/RoleMenus/role/1
    // Get menus assigned to a specific role
    [HttpGet("role/{roleId}")]
    public async Task<IActionResult> GetMenusByRoleId(int roleId)
    {
        try
        {
            var result =
                await _roleMenuService.GetMenusByRoleIdAsync(roleId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE: api/RoleMenus/1
    // Soft-delete role-menu assignment
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _roleMenuService.DeleteAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                message = "Role menu assignment not found."
            });
        }

        return Ok(new
        {
            message = "Menu assignment removed successfully."
        });
    }
}