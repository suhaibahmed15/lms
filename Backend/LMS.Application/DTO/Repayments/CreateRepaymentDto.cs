namespace LMS.Application.DTO.Repayments;

public class CreateRepaymentDto
{
    public int RepaymentScheduleId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? Remarks { get; set; }
}