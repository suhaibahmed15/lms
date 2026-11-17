
using LMS.Application.DTO.UserMenus;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserMenusController : ControllerBase
{
    private readonly IUserMenuService _userMenuService;

    public UserMenusController(IUserMenuService userMenuService)
    {
        _userMenuService = userMenuService;
    }

    // GET: api/UserMenus
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userMenuService.GetAllAsync();

        return Ok(new
        {
            message = "User menu assignments retrieved successfully.",
            data = result
        });
    }

    // GET: api/UserMenus/user/5
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        try
        {
            var result = await _userMenuService.GetByUserIdAsync(userId);

            return Ok(new
            {
                message = "User menus retrieved successfully.",
                data = result
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/UserMenus
    [HttpPost]
    public async Task<IActionResult> AssignMenu(CreateUserMenuDto dto)
    {
        try
        {
            var result = await _userMenuService.AssignMenuAsync(dto);

            return Ok(new
            {
                message = "Menu assigned to user successfully.",
                data = result
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

    // DELETE: api/UserMenus/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveMenu(int id)
    {
        try
        {
            await _userMenuService.RemoveMenuAsync(id);

            return Ok(new
            {
                message = "User menu assignment removed successfully."
            });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
