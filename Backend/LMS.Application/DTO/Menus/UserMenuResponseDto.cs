
namespace LMS.Application.DTO.UserMenus;

public class UserMenuResponseDto
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;

    public int MenuId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public string MenuKey { get; set; } = string.Empty;
    public string? Route { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
