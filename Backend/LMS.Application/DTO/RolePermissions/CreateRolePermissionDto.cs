

using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.RolePermissions
{
    public class CreateRolePermissionDto
    {
        [Range(1, int.MaxValue)]
        public int RoleId { get; set; }

        [Range (1, int.MaxValue)]
        public int PermissionId { get; set; }
    }
}
