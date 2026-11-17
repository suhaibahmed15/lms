
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.UserMenus;

public class CreateUserMenuDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int UserId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int MenuId { get; set; }
}
