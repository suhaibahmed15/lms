namespace LMS.Application.DTO.LoanGuarantors;

public class UpdateLoanGuarantorDto
{
    public string FullName { get; set; } = string.Empty;
    public string? NationalIdNumber { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? RelationshipToApplicant { get; set; }
    public string? Address { get; set; }
}
