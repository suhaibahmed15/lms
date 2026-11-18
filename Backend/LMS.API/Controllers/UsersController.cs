
using LMS.Application.DTO.Users;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // GET: api/users
    [Authorize(Policy = "Permission:USER_VIEW")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userService.GetPagedAsync();

        return Ok(result);
    }

    // GET: api/users/{id}
    [Authorize(Policy = "Permission:USER_VIEW")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new
        {
            message = "User retrieved successfully.",
            data = user
        });
    }

    // POST: api/users
    [Authorize(Policy = "Permission:USER_CREATE")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserDto request)
    {
        try
        {
            var createdUser = await _userService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdUser.Id },
                new
                {
                    message = "User created successfully.",
                    data = createdUser
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

    // POST: api/users/{id}
    // Partial update: only provided fields will change.
    [Authorize(Policy = "Permission:USER_UPDATE")]
    [HttpPost("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateUserDto request)
    {
        try
        {
            var updatedUser = await _userService.UpdateAsync(id, request);

            if (updatedUser == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(new
            {
                message = "User updated successfully.",
                data = updatedUser
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

    // DELETE: api/users/{id}
    // Only Admin or users with USER_DELETE permission can delete users.
    [Authorize(Policy = "Permission:USER_DELETE")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _userService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new
        {
            message = "User deleted successfully."
        });
    }
}
