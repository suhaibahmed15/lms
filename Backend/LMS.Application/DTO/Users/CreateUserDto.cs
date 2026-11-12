
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Users;

public class CreateUserDto
{
    [Required]
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;


    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [StringLength(30)]
    public string? PhoneNumber { get; set; }

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int RoleId { get; set; }
}
