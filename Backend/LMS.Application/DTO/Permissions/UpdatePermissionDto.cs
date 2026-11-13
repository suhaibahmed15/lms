
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Permissions;

public class UpdatePermissionDto
{
    [StringLength(150)]
    public string? Name { get; set; }

    [StringLength(100)]
    public string? Key { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public bool? IsActive { get; set; }
}
