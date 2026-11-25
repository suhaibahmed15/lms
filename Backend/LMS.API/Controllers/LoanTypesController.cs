using System.Security.Claims;
using LMS.Application.DTO.LoanTypes;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class LoanTypesController : ControllerBase
{
    private readonly ILoanTypeService _loanTypeService;

    public LoanTypesController(ILoanTypeService loanTypeService)
    {
        _loanTypeService = loanTypeService;
    }

    private int? GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue("UserId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(userIdValue, out int id) && id > 0 ? id : null;
    }

    // GET: api/LoanTypes
    // Get paged list of loan types with filtering and sorting
    [HttpGet]
    [Authorize(Policy = "Permission:LOAN_TYPE_VIEW")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _loanTypeService.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, isActive);

        return Ok(result);
    }

    // GET: api/LoanTypes/active
    // Get all active loan types for dropdowns (e.g., when a customer or officer submits a loan application)
    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var items = await _loanTypeService.GetActiveAsync();
        return Ok(new
        {
            message = "Active loan types retrieved successfully.",
            data = items
        });
    }

    // GET: api/LoanTypes/{id}
    // Get single loan type details by ID
    [HttpGet("{id:int}")]
    [Authorize(Policy = "Permission:LOAN_TYPE_VIEW")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _loanTypeService.GetByIdAsync(id);
        if (item == null)
        {
            return NotFound(new
            {
                message = $"Loan type with ID {id} was not found."
            });
        }

        return Ok(new
        {
            message = "Loan type retrieved successfully.",
            data = item
        });
    }

    // POST: api/LoanTypes
    // Create a new loan type
    [HttpPost]
    [Authorize(Policy = "Permission:LOAN_TYPE_MANAGE")]
    public async Task<IActionResult> Create([FromBody] CreateLoanTypeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            var created = await _loanTypeService.CreateAsync(dto, userId);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                new
                {
                    message = "Loan type created successfully.",
                    data = created
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

    // PUT: api/LoanTypes/{id}
    // Update existing loan type
    [HttpPut("{id:int}")]
    [Authorize(Policy = "Permission:LOAN_TYPE_MANAGE")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLoanTypeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetCurrentUserId();
            var updated = await _loanTypeService.UpdateAsync(id, dto, userId);

            if (updated == null)
            {
                return NotFound(new
                {
                    message = $"Loan type with ID {id} was not found."
                });
            }

            return Ok(new
            {
                message = "Loan type updated successfully.",
                data = updated
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

    // DELETE: api/LoanTypes/{id}
    // Soft delete loan type (blocked if active applications exist)
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "Permission:LOAN_TYPE_MANAGE")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var deleted = await _loanTypeService.DeleteAsync(id, userId);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = $"Loan type with ID {id} was not found."
                });
            }

            return Ok(new
            {
                message = "Loan type deleted successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH: api/LoanTypes/{id}/status
    // Activate or deactivate loan type
    [HttpPatch("{id:int}/status")]
    [Authorize(Policy = "Permission:LOAN_TYPE_MANAGE")]
    public async Task<IActionResult> ChangeStatus(int id, [FromQuery] bool isActive)
    {
        var userId = GetCurrentUserId();
        var result = await _loanTypeService.ChangeStatusAsync(id, isActive, userId);

        if (result == null)
        {
            return NotFound(new
            {
                message = $"Loan type with ID {id} was not found."
            });
        }

        return Ok(new
        {
            message = $"Loan type status updated to {(isActive ? "Active" : "Inactive")} successfully."
        });
    }
}
