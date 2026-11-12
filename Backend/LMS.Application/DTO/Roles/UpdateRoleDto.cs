
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Roles;

public class UpdateRoleDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(50)]
    public string? Key { get; set; }

    [StringLength(250)]
    public string? Description { get; set; }

    public bool? IsActive { get; set; }
}
