
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.AI;

public class UpdateAIPromptDto
{
    [Required]
    [StringLength(150)]
    public string PromptName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string PromptKey { get; set; } = string.Empty;

    [Required]
    public string PromptText { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}
