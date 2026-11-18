
using LMS.Application.DTO.UserMenus;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserMenusController : ControllerBase
{
    private readonly IUserMenuService _userMenuService;
    private readonly IAuthorizationService _authorizationService;

    public UserMenusController(
        IUserMenuService userMenuService,
        IAuthorizationService authorizationService)
    {
        _userMenuService = userMenuService;
        _authorizationService = authorizationService;
    }

    // GET: api/UserMenus
    [HttpGet]
    [Authorize(Policy = "Permission:USER_MENU_VIEW")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userMenuService.GetPagedAsync();

        return Ok(result);
    }

    // GET: api/UserMenus/user/5
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var currentUserIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(currentUserIdValue, out var currentUserId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        if (currentUserId != userId)
        {
            var authResult = await _authorizationService.AuthorizeAsync(
                User, null, "Permission:USER_MENU_VIEW");

            if (!authResult.Succeeded)
            {
                return Forbid();
            }
        }

        try
        {
            var result = await _userMenuService.GetPagedByUserIdAsync(userId);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/UserMenus
    [HttpPost]
    [Authorize(Policy = "Permission:MENU_MANAGE")]
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
    [Authorize(Policy = "Permission:MENU_MANAGE")]
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
