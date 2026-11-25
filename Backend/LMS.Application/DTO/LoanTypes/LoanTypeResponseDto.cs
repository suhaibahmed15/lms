namespace LMS.Application.DTO.LoanTypes;

public class LoanTypeResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal MinAmount { get; set; }

    public decimal MaxAmount { get; set; }

    public decimal InterestRate { get; set; }

    public int MinTermMonths { get; set; }

    public int MaxTermMonths { get; set; }

    public bool RequiresGuarantor { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
