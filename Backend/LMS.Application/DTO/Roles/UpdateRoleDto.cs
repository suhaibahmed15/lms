using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Roles;

public class UpdateRoleDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Key { get; set; } = string.Empty;

    [StringLength(250)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}