
namespace LMS.Domain.Entities;

public class UserMenu : BaseEntity
{
    public int UserId { get; set; }
    public int MenuId { get; set; }

    public bool IsActive { get; set; } = true;

    public User User { get; set; } = null!;
    public Menu Menu { get; set; } = null!;
}
