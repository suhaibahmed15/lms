
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using LMS.Application.DTO.AI;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace LMS.Infrastructure.BusinessLogic;

public class GroqAIService : IGroqAIService
{
    private readonly ILoanApplicationRepository _loanRepository;
    private readonly IAIPromptService _promptService;
    private readonly IAIAnalysisResultRepository _analysisRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public GroqAIService(
        ILoanApplicationRepository loanRepository,
        IAIPromptService promptService,
        IAIAnalysisResultRepository analysisRepository,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _loanRepository = loanRepository;
        _promptService = promptService;
        _analysisRepository = analysisRepository;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<AIAnalysisResponseDto> AnalyzeLoanApplicationAsync(
        int loanApplicationId)
    {
        // 1. Get loan application data
        var application = await _loanRepository
            .GetApplicationAIDataAsync(loanApplicationId);

        if (application == null)
        {
            throw new KeyNotFoundException(
                "Loan application not found.");
        }

        // 2. Get active AI prompt from database
        var prompt = await _promptService
            .GetActiveByKeyAsync("LOAN_APPLICATION_ANALYSIS");

        if (prompt == null)
        {
            throw new InvalidOperationException(
                "Active loan analysis prompt was not found.");
        }

        // 3. Read Groq configuration
        var apiKey = _configuration["Groq:ApiKey"];
        var baseUrl = _configuration["Groq:BaseUrl"];
        var model = _configuration["Groq:Model"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "Groq API key is not configured.");
        }

        if (string.IsNullOrWhiteSpace(baseUrl) ||
            string.IsNullOrWhiteSpace(model))
        {
            throw new InvalidOperationException(
                "Groq configuration is incomplete.");
        }

        // 4. Prepare application data for AI
        var applicationJson = JsonSerializer.Serialize(application);

        var userMessage = $$"""
        Analyze the following loan application data.

        {{applicationJson}}

        Return your analysis strictly as valid JSON with this structure:
        {
            "analysis": "Detailed analysis",
            "summary": "Short summary",
            "riskLevel": "Low, Medium, or High",
            "recommendations": [
                "Recommendation 1",
                "Recommendation 2"
            ]
        }

        Do not use Markdown code blocks.
        Do not make the final loan approval or rejection decision.
        """;

        // 5. Create Groq HTTP request
        var client = _httpClientFactory.CreateClient();

        var endpoint = new Uri(
            new Uri(baseUrl.EndsWith("/")
                ? baseUrl
                : baseUrl + "/"),
            "chat/completions");

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            endpoint);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = JsonContent.Create(new
        {
            model = model,
            temperature = 0.3,
            messages = new[]
            {
                new
                {
                    role = "system",
                    content = prompt.PromptText
                },
                new
                {
                    role = "user",
                    content = userMessage
                }
            }
        });

        // 6. Send request to Groq
        using var response = await client.SendAsync(request);

        var responseContent =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Groq API error ({(int)response.StatusCode}): " +
                responseContent);
        }

        // 7. Extract AI response
        using var groqJson = JsonDocument.Parse(responseContent);

        var aiContent = groqJson.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(aiContent))
        {
            throw new InvalidOperationException(
                "Groq returned an empty AI response.");
        }

        // 8. Remove possible Markdown code fences
        aiContent = aiContent.Trim();

        if (aiContent.StartsWith("```"))
        {
            var firstLineEnd = aiContent.IndexOf('\n');

            if (firstLineEnd >= 0)
                aiContent = aiContent[(firstLineEnd + 1)..];

            var lastFence = aiContent.LastIndexOf("```");

            if (lastFence >= 0)
                aiContent = aiContent[..lastFence];

            aiContent = aiContent.Trim();
        }

        // 9. Convert AI JSON into response DTO
        var result = JsonSerializer.Deserialize<AIAnalysisResponseDto>(
            aiContent,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (result == null)
        {
            throw new InvalidOperationException(
                "Unable to process Groq AI response.");
        }

        // 10. Add generation timestamp
        result.GeneratedAt = DateTime.UtcNow;

        // 11. Create database entity
        var analysisRecord = new AIAnalysisResult
        {
            LoanApplicationId = loanApplicationId,
            Analysis = result.Analysis,
            Summary = result.Summary,
            RiskLevel = result.RiskLevel,
            Recommendations = JsonSerializer.Serialize(
                result.Recommendations),
            GeneratedAt = result.GeneratedAt
        };

        // 12. Save AI analysis history
        await _analysisRepository.AddAsync(analysisRecord);

        // 13. Return AI response
        return result;
    }
}
