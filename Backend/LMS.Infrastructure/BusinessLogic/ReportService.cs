using LMS.Application.DTO.Reports;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;
using System.Text;

namespace LMS.Infrastructure.BusinessLogic;

public class ReportService : IReportService
{
    private readonly IReportRepository _repository;

    public ReportService(IReportRepository repository)
    {
        _repository = repository;
    }

    private async Task<(string RoleKey, User User)> GetValidatedUserAsync(int userId)
    {
        var user = await _repository.GetUserWithRoleAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found or inactive.");

        return (user.Role.Key.ToUpperInvariant(), user);
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "\"\"";
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }

    public async Task<List<LoanReportItemDto>> GetLoansReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);
        var targetCustomerId = roleKey == "CUSTOMER" ? userId : customerId;

        var items = await _repository.GetLoansReportAsync(fromDate, toDate, statusKey, targetCustomerId, search);

        return items.Select(l => new LoanReportItemDto
        {
            LoanId = l.Id,
            LoanNumber = l.LoanNumber,
            BorrowerId = l.BorrowerUserId,
            BorrowerName = l.BorrowerUser?.FullName ?? string.Empty,
            BorrowerEmail = l.BorrowerUser?.Email ?? string.Empty,
            LoanTypeName = l.LoanApplication?.LoanType?.Name,
            PrincipalAmount = l.PrincipalAmount,
            InterestRate = l.InterestRate,
            TermMonths = l.TermMonths,
            TotalPayableAmount = l.TotalPayableAmount,
            OutstandingBalance = l.OutstandingBalance,
            Status = l.Status?.Name ?? string.Empty,
            DisbursedAt = l.DisbursedAt,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<byte[]> ExportLoansReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null)
    {
        var list = await GetLoansReportAsync(userId, fromDate, toDate, statusKey, customerId, search);

        var sb = new StringBuilder();
        sb.AppendLine("Loan Number,Borrower Name,Borrower Email,Loan Type,Principal Amount,Interest Rate (%),Term (Months),Total Payable,Outstanding Balance,Status,Disbursed Date,Created Date");

        foreach (var x in list)
        {
            sb.AppendLine($"{EscapeCsv(x.LoanNumber)},{EscapeCsv(x.BorrowerName)},{EscapeCsv(x.BorrowerEmail)},{EscapeCsv(x.LoanTypeName)},{x.PrincipalAmount:0.00},{x.InterestRate:0.00},{x.TermMonths},{x.TotalPayableAmount:0.00},{x.OutstandingBalance:0.00},{EscapeCsv(x.Status)},{x.DisbursedAt:yyyy-MM-dd HH:mm},{x.CreatedAt:yyyy-MM-dd HH:mm}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<CustomerStatementDto> GetCustomerStatementAsync(int userId, int loanId)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        var loan = await _repository.GetLoanForStatementAsync(loanId);
        if (loan == null)
            throw new KeyNotFoundException("Loan not found.");

        if (roleKey == "CUSTOMER" && loan.BorrowerUserId != userId)
            throw new UnauthorizedAccessException("You can only access statements for your own loans.");

        var totalPaid = loan.Repayments
            .Where(r => !r.IsDeleted && r.Status?.Key == "REPAYMENT_COMPLETED")
            .Sum(r => r.Amount);

        return new CustomerStatementDto
        {
            LoanId = loan.Id,
            LoanNumber = loan.LoanNumber,
            CustomerId = loan.BorrowerUserId,
            CustomerName = loan.BorrowerUser?.FullName ?? string.Empty,
            CustomerEmail = loan.BorrowerUser?.Email ?? string.Empty,
            CustomerPhone = loan.BorrowerUser?.PhoneNumber ?? string.Empty,
            LoanTypeName = loan.LoanApplication?.LoanType?.Name,
            PrincipalAmount = loan.PrincipalAmount,
            InterestRate = loan.InterestRate,
            TermMonths = loan.TermMonths,
            TotalPayableAmount = loan.TotalPayableAmount,
            TotalPaidAmount = totalPaid,
            OutstandingBalance = loan.OutstandingBalance,
            Status = loan.Status?.Name ?? string.Empty,
            DisbursedAt = loan.DisbursedAt,
            StatementGeneratedAt = DateTime.UtcNow,
            Schedules = loan.RepaymentSchedules
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.InstallmentNumber)
                .Select(s => new CustomerStatementScheduleDto
                {
                    InstallmentNumber = s.InstallmentNumber,
                    DueDate = s.DueDate,
                    PrincipalDue = s.PrincipalDue,
                    InterestDue = s.InterestDue,
                    TotalDue = s.TotalDue,
                    PaidAmount = s.PaidAmount,
                    Status = s.Status?.Name ?? string.Empty,
                    PaidAt = s.PaidAt
                }).ToList(),
            Repayments = loan.Repayments
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.PaidAt)
                .Select(r => new CustomerStatementPaymentDto
                {
                    PaymentReference = r.PaymentReference,
                    Amount = r.Amount,
                    PrincipalPaid = r.PrincipalPaid,
                    InterestPaid = r.InterestPaid,
                    PaymentMethod = r.PaymentMethod,
                    PaidAt = r.PaidAt,
                    Status = r.Status?.Name ?? string.Empty
                }).ToList()
        };
    }

    public async Task<byte[]> ExportCustomerStatementCsvAsync(int userId, int loanId)
    {
        var stmt = await GetCustomerStatementAsync(userId, loanId);

        var sb = new StringBuilder();
        sb.AppendLine($"CUSTOMER LOAN STATEMENT");
        sb.AppendLine($"Loan Number,{EscapeCsv(stmt.LoanNumber)}");
        sb.AppendLine($"Customer Name,{EscapeCsv(stmt.CustomerName)}");
        sb.AppendLine($"Customer Email,{EscapeCsv(stmt.CustomerEmail)}");
        sb.AppendLine($"Principal Amount,{stmt.PrincipalAmount:0.00}");
        sb.AppendLine($"Total Payable Amount,{stmt.TotalPayableAmount:0.00}");
        sb.AppendLine($"Total Paid Amount,{stmt.TotalPaidAmount:0.00}");
        sb.AppendLine($"Outstanding Balance,{stmt.OutstandingBalance:0.00}");
        sb.AppendLine($"Loan Status,{EscapeCsv(stmt.Status)}");
        sb.AppendLine();
        sb.AppendLine("INSTALLMENT SCHEDULE");
        sb.AppendLine("Installment #,Due Date,Principal Due,Interest Due,Total Due,Paid Amount,Status,Paid Date");
        foreach (var s in stmt.Schedules)
        {
            sb.AppendLine($"{s.InstallmentNumber},{s.DueDate:yyyy-MM-dd},{s.PrincipalDue:0.00},{s.InterestDue:0.00},{s.TotalDue:0.00},{s.PaidAmount:0.00},{EscapeCsv(s.Status)},{s.PaidAt:yyyy-MM-dd HH:mm}");
        }
        sb.AppendLine();
        sb.AppendLine("REPAYMENT TRANSACTIONS");
        sb.AppendLine("Reference,Amount,Principal Paid,Interest Paid,Method,Status,Paid Date");
        foreach (var p in stmt.Repayments)
        {
            sb.AppendLine($"{EscapeCsv(p.PaymentReference)},{p.Amount:0.00},{p.PrincipalPaid:0.00},{p.InterestPaid:0.00},{EscapeCsv(p.PaymentMethod)},{EscapeCsv(p.Status)},{p.PaidAt:yyyy-MM-dd HH:mm}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<List<RepaymentReportItemDto>> GetRepaymentsReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);
        var targetCustomerId = roleKey == "CUSTOMER" ? userId : customerId;

        var items = await _repository.GetRepaymentsReportAsync(fromDate, toDate, statusKey, targetCustomerId, search);

        return items.Select(r => new RepaymentReportItemDto
        {
            RepaymentId = r.Id,
            PaymentReference = r.PaymentReference,
            LoanNumber = r.Loan?.LoanNumber ?? string.Empty,
            CustomerName = r.Loan?.BorrowerUser?.FullName ?? string.Empty,
            Amount = r.Amount,
            PrincipalPaid = r.PrincipalPaid,
            InterestPaid = r.InterestPaid,
            PaymentMethod = r.PaymentMethod,
            Status = r.Status?.Name ?? string.Empty,
            PaidAt = r.PaidAt
        }).ToList();
    }

    public async Task<byte[]> ExportRepaymentsReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? statusKey = null,
        int? customerId = null,
        string? search = null)
    {
        var list = await GetRepaymentsReportAsync(userId, fromDate, toDate, statusKey, customerId, search);

        var sb = new StringBuilder();
        sb.AppendLine("Payment Reference,Loan Number,Customer Name,Amount,Principal Paid,Interest Paid,Payment Method,Status,Paid Date");

        foreach (var r in list)
        {
            sb.AppendLine($"{EscapeCsv(r.PaymentReference)},{EscapeCsv(r.LoanNumber)},{EscapeCsv(r.CustomerName)},{r.Amount:0.00},{r.PrincipalPaid:0.00},{r.InterestPaid:0.00},{EscapeCsv(r.PaymentMethod)},{EscapeCsv(r.Status)},{r.PaidAt:yyyy-MM-dd HH:mm}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<List<LoanReportItemDto>> GetOutstandingLoansReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        return await GetLoansReportAsync(userId, fromDate, toDate, "LOAN_ACTIVE", customerId, search);
    }

    public async Task<byte[]> ExportOutstandingLoansReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        return await ExportLoansReportCsvAsync(userId, fromDate, toDate, "LOAN_ACTIVE", customerId, search);
    }

    public async Task<List<InstallmentReportItemDto>> GetInstallmentsReportAsync(
        int userId,
        bool overdueOnly,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);
        var targetCustomerId = roleKey == "CUSTOMER" ? userId : customerId;

        var items = await _repository.GetInstallmentsReportAsync(overdueOnly, fromDate, toDate, targetCustomerId, search);
        var now = DateTime.UtcNow.Date;

        return items.Select(s =>
        {
            var remaining = s.TotalDue - s.PaidAmount;
            var days = (now - s.DueDate.Date).Days;
            return new InstallmentReportItemDto
            {
                ScheduleId = s.Id,
                LoanNumber = s.Loan?.LoanNumber ?? string.Empty,
                CustomerName = s.Loan?.BorrowerUser?.FullName ?? string.Empty,
                InstallmentNumber = s.InstallmentNumber,
                DueDate = s.DueDate,
                TotalDue = s.TotalDue,
                PaidAmount = s.PaidAmount,
                RemainingDue = remaining > 0 ? remaining : 0,
                Status = s.Status?.Name ?? string.Empty,
                DaysOverdue = days > 0 ? days : 0
            };
        }).ToList();
    }

    public async Task<byte[]> ExportInstallmentsReportCsvAsync(
        int userId,
        bool overdueOnly,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        var list = await GetInstallmentsReportAsync(userId, overdueOnly, fromDate, toDate, customerId, search);

        var sb = new StringBuilder();
        sb.AppendLine("Loan Number,Customer Name,Installment #,Due Date,Total Due,Paid Amount,Remaining Due,Status,Days Overdue");

        foreach (var x in list)
        {
            sb.AppendLine($"{EscapeCsv(x.LoanNumber)},{EscapeCsv(x.CustomerName)},{x.InstallmentNumber},{x.DueDate:yyyy-MM-dd},{x.TotalDue:0.00},{x.PaidAmount:0.00},{x.RemainingDue:0.00},{EscapeCsv(x.Status)},{x.DaysOverdue}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<List<DisbursementReportItemDto>> GetDisbursementsReportAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);
        var targetCustomerId = roleKey == "CUSTOMER" ? userId : customerId;

        var items = await _repository.GetDisbursementsReportAsync(fromDate, toDate, targetCustomerId, search);

        return items.Select(l => new DisbursementReportItemDto
        {
            LoanId = l.Id,
            LoanNumber = l.LoanNumber,
            CustomerName = l.BorrowerUser?.FullName ?? string.Empty,
            LoanTypeName = l.LoanApplication?.LoanType?.Name,
            PrincipalAmount = l.PrincipalAmount,
            InterestRate = l.InterestRate,
            TermMonths = l.TermMonths,
            TotalPayableAmount = l.TotalPayableAmount,
            DisbursedAt = l.DisbursedAt,
            DisbursedByName = l.DisbursedByUser?.FullName
        }).ToList();
    }

    public async Task<byte[]> ExportDisbursementsReportCsvAsync(
        int userId,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? customerId = null,
        string? search = null)
    {
        var list = await GetDisbursementsReportAsync(userId, fromDate, toDate, customerId, search);

        var sb = new StringBuilder();
        sb.AppendLine("Loan Number,Customer Name,Loan Type,Principal Amount,Interest Rate (%),Term (Months),Total Payable,Disbursed Date,Disbursed By");

        foreach (var x in list)
        {
            sb.AppendLine($"{EscapeCsv(x.LoanNumber)},{EscapeCsv(x.CustomerName)},{EscapeCsv(x.LoanTypeName)},{x.PrincipalAmount:0.00},{x.InterestRate:0.00},{x.TermMonths},{x.TotalPayableAmount:0.00},{x.DisbursedAt:yyyy-MM-dd HH:mm},{EscapeCsv(x.DisbursedByName)}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
