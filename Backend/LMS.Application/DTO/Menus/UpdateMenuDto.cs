namespace LMS.Application.DTO.Menus;

public class UpdateMenuDto
{
    public string? Name { get; set; }
    public string? Key { get; set; }
    public string? Route { get; set; }
    public string? Icon { get; set; }
    public int? DisplayOrder { get; set; }
    public int? ParentMenuId { get; set; }
    public bool? IsActive { get; set; }
}