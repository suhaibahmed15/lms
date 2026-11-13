
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Permissions;

public class CreatePermissionDto
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Key { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}
