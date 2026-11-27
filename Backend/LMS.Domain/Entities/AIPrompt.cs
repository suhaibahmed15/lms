
namespace LMS.Domain.Entities;

public class AIPrompt : BaseEntity
{
    public string PromptName { get; set; } = string.Empty;

    public string PromptKey { get; set; } = string.Empty;

    public string PromptText { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}
    