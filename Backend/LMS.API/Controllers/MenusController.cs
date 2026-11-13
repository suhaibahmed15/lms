using LMS.Application.DTO.Menus;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenusController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenusController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    // GET: api/Menus
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var menus = await _menuService.GetAllAsync();

        return Ok(menus);
    }

    // GET: api/Menus/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var menu = await _menuService.GetByIdAsync(id);

        if (menu == null)
            return NotFound(new { message = "Menu not found." });

        return Ok(menu);
    }

    // POST: api/Menus
    [HttpPost]
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