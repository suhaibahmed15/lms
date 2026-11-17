
namespace LMS.Domain.Entities;

public class LoanApplicationAssignment : BaseEntity
{
    public int LoanApplicationId { get; set; }

    public int AssignedToUserId { get; set; }
    public int AssignedByUserId { get; set; }

    public DateTime AssignedAt { get; set; }

    // Relationships
    public LoanApplication LoanApplication { get; set; } = null!;

    public User AssignedToUser { get; set; } = null!;
    public User AssignedByUser { get; set; } = null!;
}
