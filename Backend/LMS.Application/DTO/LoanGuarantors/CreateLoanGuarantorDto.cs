
using System.ComponentModel.DataAnnotations;

namespace LMS.Application.DTO.LoanGuarantors;

public class CreateLoanGuarantorDto
{
    [Required]
    public int LoanApplicationId { get; set; }

    [Required]
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? NationalIdNumber { get; set; }

    [Required]
    [Phone]
    [StringLength(30)]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(256)]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? RelationshipToApplicant { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }
}
