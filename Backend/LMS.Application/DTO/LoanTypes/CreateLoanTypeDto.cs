using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanTypes;

public class CreateLoanTypeDto
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Range(0, 100000000)]
    public decimal MinAmount { get; set; }

    [Range(0, 100000000)]
    public decimal MaxAmount { get; set; }

    [Range(0, 100)]
    public decimal InterestRate { get; set; }

    [Range(1, 360)]
    public int MinTermMonths { get; set; }

    [Range(1, 360)]
    public int MaxTermMonths { get; set; }

    public bool RequiresGuarantor { get; set; }

    public bool IsActive { get; set; } = true;
}
