
using LMS.Application.DTO.AI;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[Route("api/ai-analysis")]
[ApiController]
[Authorize]
public class AIAnalysisController : ControllerBase
{
    private readonly IGroqAIService _groqAIService;
    private readonly IAIAnalysisResultService _analysisResultService;

    public AIAnalysisController(
        IGroqAIService groqAIService,
        IAIAnalysisResultService analysisResultService)
    {
        _groqAIService = groqAIService;
        _analysisResultService = analysisResultService;
    }

    // Analyze a loan application using Groq AI
    [HttpPost("loan-application")]
    public async Task<IActionResult> AnalyzeLoanApplication(
        [FromBody] AIAnalysisRequestDto dto)
    {
        try
        {
            var result = await _groqAIService
                .AnalyzeLoanApplicationAsync(dto.LoanApplicationId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (HttpRequestException)
        {
            return StatusCode(502, new
            {
                message = "The AI provider could not process your request."
            });
        }
    }

    // Get all AI analysis history for a loan application
    [HttpGet("loan-application/{loanApplicationId}/history")]
    public async Task<IActionResult> GetAnalysisHistory(
        int loanApplicationId)
    {
        var history = await _analysisResultService
            .GetHistoryAsync(loanApplicationId);

        return Ok(history);
    }

    // Get a specific AI analysis result
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAnalysisById(int id)
    {
        var result = await _analysisResultService.GetByIdAsync(id);

        if (result == null)
        {
            return NotFound(new
            {
                message = "AI analysis record not found."
            });
        }

        return Ok(result);
    }
}
