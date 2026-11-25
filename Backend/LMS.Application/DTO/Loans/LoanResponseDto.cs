namespace LMS.Application.DTO.Loans;

public class LoanResponseDto
{
    public int Id { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public int LoanApplicationId { get; set; }
    public int BorrowerUserId { get; set; }
    public string BorrowerName { get; set; } = string.Empty;
    public string BorrowerEmail { get; set; } = string.Empty;
    public string? LoanTypeName { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public decimal TotalPayableAmount { get; set; }
    public decimal OutstandingBalance { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;
    public DateTime? DisbursedAt { get; set; }
    public int? DisbursedByUserId { get; set; }
    public string? DisbursedByName { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LoanDetailsDto : LoanResponseDto
{
    public List<LoanScheduleItemDto> Schedules { get; set; } = new();
    public List<LoanRepaymentItemDto> Repayments { get; set; } = new();
}

public class LoanScheduleItemDto
{
    public int Id { get; set; }
    public int InstallmentNumber { get; set; }
    public DateTime DueDate { get; set; }
    public decimal PrincipalDue { get; set; }
    public decimal InterestDue { get; set; }
    public decimal TotalDue { get; set; }
    public decimal PaidAmount { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
}

public class LoanRepaymentItemDto
{
    public int Id { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PrincipalPaid { get; set; }
    public decimal InterestPaid { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime PaidAt { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string StatusKey { get; set; } = string.Empty;
    public string? Remarks { get; set; }
}
