using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdValue = User.FindFirst("UserId")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return int.TryParse(userIdValue, out userId) && userId > 0;
    }

    // GET: api/Reports/loans
    [HttpGet("loans")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetLoans(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? statusKey = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var data = await _reportService.GetLoansReportAsync(
            userId, fromDate, toDate, statusKey, customerId, search);

        return Ok(new { message = "Loans report retrieved successfully.", data });
    }

    // GET: api/Reports/loans/export-csv
    [HttpGet("loans/export-csv")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> ExportLoansCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? statusKey = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var fileBytes = await _reportService.ExportLoansReportCsvAsync(
            userId, fromDate, toDate, statusKey, customerId, search);

        return File(fileBytes, "text/csv", $"loans_report_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    // GET: api/Reports/customer-statement/{loanId}
    [HttpGet("customer-statement/{loanId:int}")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetCustomerStatement(int loanId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var data = await _reportService.GetCustomerStatementAsync(userId, loanId);
            return Ok(new { message = "Customer statement retrieved successfully.", data });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    // GET: api/Reports/customer-statement/{loanId}/export-csv
    [HttpGet("customer-statement/{loanId:int}/export-csv")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> ExportCustomerStatementCsv(int loanId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var fileBytes = await _reportService.ExportCustomerStatementCsvAsync(userId, loanId);
            return File(fileBytes, "text/csv", $"statement_loan_{loanId}_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    // GET: api/Reports/repayments
    [HttpGet("repayments")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> GetRepayments(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? statusKey = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var data = await _reportService.GetRepaymentsReportAsync(
            userId, fromDate, toDate, statusKey, customerId, search);

        return Ok(new { message = "Repayments report retrieved successfully.", data });
    }

    // GET: api/Reports/repayments/export-csv
    [HttpGet("repayments/export-csv")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> ExportRepaymentsCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? statusKey = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var fileBytes = await _reportService.ExportRepaymentsReportCsvAsync(
            userId, fromDate, toDate, statusKey, customerId, search);

        return File(fileBytes, "text/csv", $"repayments_report_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    // GET: api/Reports/outstanding
    [HttpGet("outstanding")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetOutstanding(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var data = await _reportService.GetOutstandingLoansReportAsync(
            userId, fromDate, toDate, customerId, search);

        return Ok(new { message = "Outstanding loans report retrieved successfully.", data });
    }

    // GET: api/Reports/outstanding/export-csv
    [HttpGet("outstanding/export-csv")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> ExportOutstandingCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var fileBytes = await _reportService.ExportOutstandingLoansReportCsvAsync(
            userId, fromDate, toDate, customerId, search);

        return File(fileBytes, "text/csv", $"outstanding_loans_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    // GET: api/Reports/pending-installments
    [HttpGet("pending-installments")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> GetPendingInstallments(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var data = await _reportService.GetInstallmentsReportAsync(
            userId, overdueOnly: false, fromDate, toDate, customerId, search);

        return Ok(new { message = "Pending installments report retrieved successfully.", data });
    }

    // GET: api/Reports/pending-installments/export-csv
    [HttpGet("pending-installments/export-csv")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> ExportPendingInstallmentsCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var fileBytes = await _reportService.ExportInstallmentsReportCsvAsync(
            userId, overdueOnly: false, fromDate, toDate, customerId, search);

        return File(fileBytes, "text/csv", $"pending_installments_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    // GET: api/Reports/overdue-installments
    [HttpGet("overdue-installments")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> GetOverdueInstallments(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var data = await _reportService.GetInstallmentsReportAsync(
            userId, overdueOnly: true, fromDate, toDate, customerId, search);

        return Ok(new { message = "Overdue installments report retrieved successfully.", data });
    }

    // GET: api/Reports/overdue-installments/export-csv
    [HttpGet("overdue-installments/export-csv")]
    [Authorize(Policy = "Permission:REPAYMENT_VIEW")]
    public async Task<IActionResult> ExportOverdueInstallmentsCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var fileBytes = await _reportService.ExportInstallmentsReportCsvAsync(
            userId, overdueOnly: true, fromDate, toDate, customerId, search);

        return File(fileBytes, "text/csv", $"overdue_installments_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }

    // GET: api/Reports/disbursements
    [HttpGet("disbursements")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> GetDisbursements(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var data = await _reportService.GetDisbursementsReportAsync(
            userId, fromDate, toDate, customerId, search);

        return Ok(new { message = "Disbursements report retrieved successfully.", data });
    }

    // GET: api/Reports/disbursements/export-csv
    [HttpGet("disbursements/export-csv")]
    [Authorize(Policy = "Permission:LOAN_VIEW")]
    public async Task<IActionResult> ExportDisbursementsCsv(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int? customerId = null,
        [FromQuery] string? search = null)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var fileBytes = await _reportService.ExportDisbursementsReportCsvAsync(
            userId, fromDate, toDate, customerId, search);

        return File(fileBytes, "text/csv", $"disbursements_report_{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
    }
}
