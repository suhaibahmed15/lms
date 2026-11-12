
using LMS.Application.DTO.Statuses;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class StatusesController : ControllerBase
{
    private readonly IStatusService _statusService;

    public StatusesController(IStatusService statusService)
    {
        _statusService = statusService;
    }

    // GET: api/statuses
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var statuses = await _statusService.GetAllAsync();

        return Ok(new
        {
            message = "Statuses retrieved successfully.",
            data = statuses
        });
    }

    // GET: api/statuses/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var status = await _statusService.GetByIdAsync(id);

        if (status == null)
        {
            return NotFound(new
            {
                message = "Status not found."
            });
        }

        return Ok(new
        {
            message = "Status retrieved successfully.",
            data = status
        });
    }

    // POST: api/statuses
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateStatusDto request)
    {
        try
        {
            var createdStatus =
                await _statusService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdStatus.Id },
                new
                {
                    message = "Status created successfully.",
                    data = createdStatus
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

    // POST: api/statuses/{id}
    // Partial update: only provided fields will change.
    [HttpPost("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateStatusDto request)
    {
        try
        {
            var updatedStatus =
                await _statusService.UpdateAsync(id, request);

            if (updatedStatus == null)
            {
                return NotFound(new
                {
                    message = "Status not found."
                });
            }

            return Ok(new
            {
                message = "Status updated successfully.",
                data = updatedStatus
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

    // POST: api/statuses/{id}/status
    // Activate or deactivate a status.
    [HttpPost("{id:int}/status")]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromBody] ChangeStatusActiveDto request)
    {
        var result = await _statusService.ChangeStatusAsync(
            id,
            request.IsActive);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Status not found."
            });
        }

        return Ok(new
        {
            message = request.IsActive
                ? "Status activated successfully."
                : "Status deactivated successfully."
        });
    }

    // DELETE: api/statuses/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _statusService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Status not found."
            });
        }

        return Ok(new
        {
            message = "Status deleted successfully."
        });
    }
}
