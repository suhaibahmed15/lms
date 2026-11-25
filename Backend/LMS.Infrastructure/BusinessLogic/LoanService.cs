using LMS.Application.DTO.Loans;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanService : ILoanService
{
    private readonly ILoanRepository _repository;

    public LoanService(ILoanRepository repository)
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

    public async Task<object> GetPagedAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : Math.Min(pageSize, 100);

        int? targetCustomerId = null;
        int? targetOfficerId = null;

        if (roleKey == "CUSTOMER")
        {
            targetCustomerId = userId;
        }
        else if (roleKey == "OFFICER" || roleKey == "LOAN_OFFICER")
        {
            targetOfficerId = userId;
            targetCustomerId = customerId;
        }
        else if (roleKey == "ADMIN" || roleKey == "MANAGER")
        {
            targetCustomerId = customerId;
        }

        var (items, total) = await _repository.GetPagedAsync(
            pageNumber, pageSize, search, statusKey, targetCustomerId, targetOfficerId);

        var dtos = items.Select(MapToResponseDto).ToList();
        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);

        return new
        {
            message = "Loans retrieved successfully.",
            data = dtos,
            totalRecords = total,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    public async Task<LoanDetailsDto> GetByIdAsync(int userId, int loanId)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        var loan = await _repository.GetByIdWithDetailsAsync(loanId);
        if (loan == null)
            throw new KeyNotFoundException("Loan not found.");

        ValidateLoanAccess(userId, roleKey, loan);

        var dto = new LoanDetailsDto
        {
            Id = loan.Id,
            LoanNumber = loan.LoanNumber,
            LoanApplicationId = loan.LoanApplicationId,
            BorrowerUserId = loan.BorrowerUserId,
            BorrowerName = loan.BorrowerUser?.FullName ?? string.Empty,
            BorrowerEmail = loan.BorrowerUser?.Email ?? string.Empty,
            LoanTypeName = loan.LoanApplication?.LoanType?.Name,
            PrincipalAmount = loan.PrincipalAmount,
            InterestRate = loan.InterestRate,
            TermMonths = loan.TermMonths,
            TotalPayableAmount = loan.TotalPayableAmount,
            OutstandingBalance = loan.OutstandingBalance,
            StatusId = loan.StatusId,
            StatusName = loan.Status?.Name ?? string.Empty,
            StatusKey = loan.Status?.Key ?? string.Empty,
            DisbursedAt = loan.DisbursedAt,
            DisbursedByUserId = loan.DisbursedByUserId,
            DisbursedByName = loan.DisbursedByUser?.FullName,
            ClosedAt = loan.ClosedAt,
            CreatedAt = loan.CreatedAt,
            Schedules = loan.RepaymentSchedules
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.InstallmentNumber)
                .Select(s => new LoanScheduleItemDto
                {
                    Id = s.Id,
                    InstallmentNumber = s.InstallmentNumber,
                    DueDate = s.DueDate,
                    PrincipalDue = s.PrincipalDue,
                    InterestDue = s.InterestDue,
                    TotalDue = s.TotalDue,
                    PaidAmount = s.PaidAmount,
                    StatusName = s.Status?.Name ?? string.Empty,
                    StatusKey = s.Status?.Key ?? string.Empty,
                    PaidAt = s.PaidAt
                }).ToList(),
            Repayments = loan.Repayments
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.PaidAt)
                .Select(r => new LoanRepaymentItemDto
                {
                    Id = r.Id,
                    PaymentReference = r.PaymentReference,
                    Amount = r.Amount,
                    PrincipalPaid = r.PrincipalPaid,
                    InterestPaid = r.InterestPaid,
                    PaymentMethod = r.PaymentMethod,
                    PaidAt = r.PaidAt,
                    StatusName = r.Status?.Name ?? string.Empty,
                    StatusKey = r.Status?.Key ?? string.Empty,
                    Remarks = r.Remarks
                }).ToList()
        };

        return dto;
    }

    public async Task<object> GetMyLoansAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? statusKey = null)
    {
        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : Math.Min(pageSize, 100);

        var (items, total) = await _repository.GetPagedAsync(
            pageNumber, pageSize, null, statusKey, customerId: userId, officerId: null);

        var dtos = items.Select(MapToResponseDto).ToList();
        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);

        return new
        {
            message = "My loans retrieved successfully.",
            data = dtos,
            totalRecords = total,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    public async Task<List<LoanScheduleItemDto>> GetRepaymentScheduleAsync(int userId, int loanId)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        var loan = await _repository.GetByIdAsync(loanId);
        if (loan == null)
            throw new KeyNotFoundException("Loan not found.");

        ValidateLoanAccess(userId, roleKey, loan);

        var schedules = await _repository.GetRepaymentScheduleAsync(loanId);

        return schedules.Select(s => new LoanScheduleItemDto
        {
            Id = s.Id,
            InstallmentNumber = s.InstallmentNumber,
            DueDate = s.DueDate,
            PrincipalDue = s.PrincipalDue,
            InterestDue = s.InterestDue,
            TotalDue = s.TotalDue,
            PaidAmount = s.PaidAmount,
            StatusName = s.Status?.Name ?? string.Empty,
            StatusKey = s.Status?.Key ?? string.Empty,
            PaidAt = s.PaidAt
        }).ToList();
    }

    public async Task<List<LoanRepaymentItemDto>> GetRepaymentHistoryAsync(int userId, int loanId)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        var loan = await _repository.GetByIdAsync(loanId);
        if (loan == null)
            throw new KeyNotFoundException("Loan not found.");

        ValidateLoanAccess(userId, roleKey, loan);

        var repayments = await _repository.GetRepaymentHistoryAsync(loanId);

        return repayments.Select(r => new LoanRepaymentItemDto
        {
            Id = r.Id,
            PaymentReference = r.PaymentReference,
            Amount = r.Amount,
            PrincipalPaid = r.PrincipalPaid,
            InterestPaid = r.InterestPaid,
            PaymentMethod = r.PaymentMethod,
            PaidAt = r.PaidAt,
            StatusName = r.Status?.Name ?? string.Empty,
            StatusKey = r.Status?.Key ?? string.Empty,
            Remarks = r.Remarks
        }).ToList();
    }

    private static void ValidateLoanAccess(int userId, string roleKey, Loan loan)
    {
        if (roleKey == "ADMIN" || roleKey == "MANAGER")
            return;

        if (roleKey == "CUSTOMER")
        {
            if (loan.BorrowerUserId != userId)
                throw new UnauthorizedAccessException("You can only access your own loans.");
            return;
        }

        if (roleKey == "OFFICER" || roleKey == "LOAN_OFFICER")
        {
            if (loan.LoanApplication != null &&
                loan.LoanApplication.AssignedToUserId != userId &&
                loan.LoanApplication.AssignedToUserId != null)
            {
                throw new UnauthorizedAccessException("You can only access loans assigned to you.");
            }
            return;
        }

        throw new UnauthorizedAccessException("You are not authorized to view this loan.");
    }

    private static LoanResponseDto MapToResponseDto(Loan l)
    {
        return new LoanResponseDto
        {
            Id = l.Id,
            LoanNumber = l.LoanNumber,
            LoanApplicationId = l.LoanApplicationId,
            BorrowerUserId = l.BorrowerUserId,
            BorrowerName = l.BorrowerUser?.FullName ?? string.Empty,
            BorrowerEmail = l.BorrowerUser?.Email ?? string.Empty,
            LoanTypeName = l.LoanApplication?.LoanType?.Name,
            PrincipalAmount = l.PrincipalAmount,
            InterestRate = l.InterestRate,
            TermMonths = l.TermMonths,
            TotalPayableAmount = l.TotalPayableAmount,
            OutstandingBalance = l.OutstandingBalance,
            StatusId = l.StatusId,
            StatusName = l.Status?.Name ?? string.Empty,
            StatusKey = l.Status?.Key ?? string.Empty,
            DisbursedAt = l.DisbursedAt,
            DisbursedByUserId = l.DisbursedByUserId,
            DisbursedByName = l.DisbursedByUser?.FullName,
            ClosedAt = l.ClosedAt,
            CreatedAt = l.CreatedAt
        };
    }
}
