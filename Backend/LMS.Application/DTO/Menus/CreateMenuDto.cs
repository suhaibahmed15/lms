using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.Menus;

public class CreateMenuDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Route { get; set; }

    [MaxLength(100)]
    public string? Icon { get; set; }

    [Range(0, int.MaxValue)]
    public int DisplayOrder { get; set; }

    public int? ParentMenuId { get; set; }

    public bool IsActive { get; set; } = true;
}