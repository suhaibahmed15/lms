
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.UserPermissions;

public class CreateUserPermissionDto
{
    [Range(1, int.MaxValue)]
    public int UserId { get; set; }

    [Range(1, int.MaxValue)]
    public int PermissionId { get; set; }

    [Range(1, int.MaxValue)]
    public int? AssignedByUserId { get; set; }
}
