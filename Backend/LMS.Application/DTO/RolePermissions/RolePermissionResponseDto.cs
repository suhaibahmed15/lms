namespace LMS.Application.DTO.RolePermissions;

public class RolePermissionResponseDto
{
    public int Id { get; set; }

    public int RoleId { get; set; }
    public int PermissionId { get; set; }

    public string PermissionName { get; set; } = string.Empty;
    public string PermissionKey { get; set; } = string.Empty;

    public string? Description { get; set; }
    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}