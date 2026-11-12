
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Users;

public class UpdateUserDto
{
    [StringLength(150)]
    public string? FullName { get; set; }

    
    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(30)]
    public string? PhoneNumber { get; set; }

    public int? RoleId { get; set; }
}
