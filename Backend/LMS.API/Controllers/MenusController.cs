using LMS.Application.DTO.Menus;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MenusController : ControllerBase
{
    private readonly IMenuService _menuService;
    private readonly IAuthorizationService _authorizationService;

    public MenusController(
        IMenuService menuService,
        IAuthorizationService authorizationService)
    {
        _menuService = menuService;
        _authorizationService = authorizationService;
    }

    // GET: api/Menus
    [HttpGet]
    [Authorize(Policy = "Permission:MENU_VIEW")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _menuService.GetPagedAsync();

        return Ok(result);
    }

    // GET: api/Menus/1
    [HttpGet("{id:int}")]
    [Authorize(Policy = "Permission:MENU_VIEW")]
    public async Task<IActionResult> GetById(int id)
    {
        var menu = await _menuService.GetByIdAsync(id);

        if (menu == null)
            return NotFound(new { message = "Menu not found." });

        return Ok(menu);
    }

    // POST: api/Menus
    [HttpPost]
    [Authorize(Policy = "Permission:MENU_MANAGE")]
    public async Task<IActionResult> Create(CreateMenuDto dto)
    {
        try
        {
            var menu = await _menuService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = menu.Id },
                menu);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/Menus/user/1
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetMenusByUserId(int userId)
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
                User, null, "Permission:MENU_MANAGE");

            if (!authResult.Succeeded)
            {
                return Forbid();
            }
        }

        try
        {
            var menus = await _menuService.GetMenusByUserIdAsync(userId);

            return Ok(menus);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // POST: api/Menus/1
    [HttpPost("{id:int}")]
    [Authorize(Policy = "Permission:MENU_MANAGE")]
    public async Task<IActionResult> Update(int id, UpdateMenuDto dto)
    {
        try
        {
            var menu = await _menuService.UpdateAsync(id, dto);

            if (menu == null)
                return NotFound(new { message = "Menu not found." });

            return Ok(menu);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE: api/Menus/1
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Permission:MENU_MANAGE")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deleted = await _menuService.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { message = "Menu not found." });

            return Ok(new { message = "Menu deleted successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}