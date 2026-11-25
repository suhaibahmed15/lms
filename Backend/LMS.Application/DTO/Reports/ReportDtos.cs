namespace LMS.Application.DTO.Reports;

public class LoanReportItemDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public int BorrowerId { get; set; }
    public string BorrowerName { get; set; } = string.Empty;
    public string BorrowerEmail { get; set; } = string.Empty;
    public string? LoanTypeName { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public decimal TotalPayableAmount { get; set; }
    public decimal OutstandingBalance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? DisbursedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CustomerStatementDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? LoanTypeName { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public decimal TotalPayableAmount { get; set; }
    public decimal TotalPaidAmount { get; set; }
    public decimal OutstandingBalance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? DisbursedAt { get; set; }
    public DateTime StatementGeneratedAt { get; set; }

    public List<CustomerStatementScheduleDto> Schedules { get; set; } = new();
    public List<CustomerStatementPaymentDto> Repayments { get; set; } = new();
}

public class CustomerStatementScheduleDto
{
    public int InstallmentNumber { get; set; }
    public DateTime DueDate { get; set; }
    public decimal PrincipalDue { get; set; }
    public decimal InterestDue { get; set; }
    public decimal TotalDue { get; set; }
    public decimal PaidAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
}

public class CustomerStatementPaymentDto
{
    public string PaymentReference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PrincipalPaid { get; set; }
    public decimal InterestPaid { get; set; }
    public string? PaymentMethod { get; set; }
    public DateTime PaidAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class RepaymentReportItemDto
{
    public int RepaymentId { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public string LoanNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PrincipalPaid { get; set; }
    public decimal InterestPaid { get; set; }
    public string? PaymentMethod { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime PaidAt { get; set; }
}

public class InstallmentReportItemDto
{
    public int ScheduleId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public int InstallmentNumber { get; set; }
    public DateTime DueDate { get; set; }
    public decimal TotalDue { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingDue { get; set; }
    public string Status { get; set; } = string.Empty;
    public int DaysOverdue { get; set; }
}

public class DisbursementReportItemDto
{
    public int LoanId { get; set; }
    public string LoanNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? LoanTypeName { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public decimal TotalPayableAmount { get; set; }
    public DateTime? DisbursedAt { get; set; }
    public string? DisbursedByName { get; set; }
}
