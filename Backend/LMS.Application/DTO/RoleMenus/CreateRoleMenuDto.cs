using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.RoleMenus;

public class CreateRoleMenuDto
{
    [Range(1, int.MaxValue)]
    public int RoleId { get; set; }

    [Range(1, int.MaxValue)]
    public int MenuId { get; set; }
}