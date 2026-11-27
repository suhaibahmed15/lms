
namespace LMS.Application.DTO.AI;

public class AIPromptResponseDto
{
    public int Id { get; set; }

    public string PromptName { get; set; } = string.Empty;

    public string PromptKey { get; set; } = string.Empty;

    public string PromptText { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
