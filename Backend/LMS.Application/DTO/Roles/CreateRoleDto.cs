using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Roles;

public class CreateRoleDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Key { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}