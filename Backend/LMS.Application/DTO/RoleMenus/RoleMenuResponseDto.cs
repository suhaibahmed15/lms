namespace LMS.Application.DTO.RoleMenus;

public class RoleMenuResponseDto
{
    public int Id { get; set; }

    public int RoleId { get; set; }
    public int MenuId { get; set; }

    public string MenuName { get; set; } = string.Empty;
    public string MenuKey { get; set; } = string.Empty;

    public string? Route { get; set; }
    public string? Icon { get; set; }

    public int DisplayOrder { get; set; }
    public int? ParentMenuId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}