
using LMS.Application.DTO.AI;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[Route("api/ai-prompts")]
[ApiController]
[Authorize]
public class AIPromptController : ControllerBase
{
    private readonly IAIPromptService _aiPromptService;

    public AIPromptController(IAIPromptService aiPromptService)
    {
        _aiPromptService = aiPromptService;
    }

    // Get all AI prompts
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var prompts = await _aiPromptService.GetAllAsync();
        return Ok(prompts);
    }

    // Get AI prompt by ID
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var prompt = await _aiPromptService.GetByIdAsync(id);

        if (prompt == null)
            return NotFound(new { message = "AI prompt not found." });

        return Ok(prompt);
    }

    // Get active AI prompt by key
    [HttpGet("key/{promptKey}")]
    public async Task<IActionResult> GetByKey(string promptKey)
    {
        var prompt = await _aiPromptService.GetActiveByKeyAsync(promptKey);

        if (prompt == null)
            return NotFound(new { message = "Active AI prompt not found." });

        return Ok(prompt);
    }

    // Create AI prompt
    [HttpPost]
    public async Task<IActionResult> Create(CreateAIPromptDto dto)
    {
        try
        {
            var prompt = await _aiPromptService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = prompt.Id },
                prompt
            );
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // Update AI prompt
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateAIPromptDto dto)
    {
        try
        {
            var prompt = await _aiPromptService.UpdateAsync(id, dto);

            if (prompt == null)
                return NotFound(new { message = "AI prompt not found." });

            return Ok(prompt);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // Soft delete AI prompt
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _aiPromptService.DeleteAsync(id);

        if (!deleted)
            return NotFound(new { message = "AI prompt not found." });

        return Ok(new { message = "AI prompt deleted successfully." });
    }
}
