
namespace LMS.Application.DTO.UserPermissions;

public class UserPermissionResponseDto
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;

    public int PermissionId { get; set; }
    public string PermissionName { get; set; } = string.Empty;
    public string PermissionKey { get; set; } = string.Empty;

    public int? AssignedByUserId { get; set; }
    public DateTime AssignedAt { get; set; }

    public bool IsActive { get; set; }

    public int? RevokedByUserId { get; set; }
    public DateTime? RevokedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
