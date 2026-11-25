using LMS.Application.DTO.Repayments;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class RepaymentService : IRepaymentService
{
    private readonly IRepaymentRepository _repository;

    public RepaymentService(IRepaymentRepository repository)
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

    // Customer or Staff submits/records a payment
    public async Task<int> CreateAsync(
        int userId,
        CreateRepaymentDto dto)
    {
        var user = await _repository.GetUserByIdAsync(userId);

        if (user == null)
        {
            throw new UnauthorizedAccessException(
                "User not found or inactive.");
        }

        var roleKey = user.Role.Key.ToUpperInvariant();
        var isStaff = roleKey is "ADMIN" or "MANAGER" or "OFFICER" or "LOAN_OFFICER";

        if (!isStaff && roleKey != "CUSTOMER")
        {
            throw new UnauthorizedAccessException(
                "Only authorized staff or active customers can submit payments.");
        }

        if (dto.Amount <= 0)
            throw new ArgumentException(
                "Payment amount must be greater than zero.");

        var reference = dto.PaymentReference?.Trim();

        if (string.IsNullOrWhiteSpace(reference))
            throw new ArgumentException(
                "Payment reference is required.");

        if (reference.Length > 100)
            throw new ArgumentException(
                "Payment reference cannot exceed 100 characters.");

        if (await _repository.PaymentReferenceExistsAsync(reference))
            throw new InvalidOperationException(
                "Payment reference already exists.");

        var schedule = isStaff
            ? await _repository.GetScheduleByIdAsync(dto.RepaymentScheduleId)
            : await _repository.GetScheduleForCustomerAsync(dto.RepaymentScheduleId, userId);

        if (schedule == null)
            throw new KeyNotFoundException(
                "Repayment schedule not found.");

        if (schedule.Loan.Status.Key != "LOAN_ACTIVE")
            throw new InvalidOperationException(
                "Payments can only be submitted for active loans.");

        if (schedule.Status.Key == "REPAYMENT_COMPLETED")
            throw new InvalidOperationException(
                "This installment has already been completed.");

        if (await _repository.HasPendingPaymentAsync(schedule.Id))
            throw new InvalidOperationException(
                "A payment for this installment is already awaiting verification.");

        var remainingInstallment =
            schedule.TotalDue - schedule.PaidAmount;

        if (dto.Amount > remainingInstallment)
            throw new ArgumentException(
                $"Payment cannot exceed the remaining installment amount of {remainingInstallment:0.00}.");

        if (dto.Amount > schedule.Loan.OutstandingBalance)
            throw new ArgumentException(
                "Payment cannot exceed the outstanding loan balance.");

        var pendingStatus =
            await _repository.GetStatusByKeyAsync(
                "REPAYMENT_PENDING",
                "Repayment");

        if (pendingStatus == null)
            throw new KeyNotFoundException(
                "Pending repayment status not found.");

        var repayment = new Repayment
        {
            LoanId = schedule.LoanId,
            RepaymentScheduleId = schedule.Id,
            StatusId = pendingStatus.Id,
            PaymentReference = reference,
            Amount = dto.Amount,
            PrincipalPaid = 0,
            InterestPaid = 0,
            PaidAt = DateTime.UtcNow,
            PaymentMethod = dto.PaymentMethod?.Trim(),
            RecordedByUserId = userId,
            Remarks = dto.Remarks?.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            IsDeleted = false
        };

        return await _repository.CreateAsync(repayment);
    }

    public async Task<List<Repayment>> GetPendingPaymentsAsync()
    {
        return await _repository.GetPendingPaymentsAsync();
    }

    public async Task<object> GetPagedAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null,
        int? loanId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : Math.Min(pageSize, 100);

        int? targetCustomerId = customerId;
        if (roleKey == "CUSTOMER")
        {
            targetCustomerId = userId;
        }

        var (items, total) = await _repository.GetPagedAsync(
            pageNumber, pageSize, search, statusKey, targetCustomerId, loanId, fromDate, toDate);

        var data = items.Select(x => new
        {
            x.Id,
            x.LoanId,
            LoanNumber = x.Loan?.LoanNumber,
            x.RepaymentScheduleId,
            x.PaymentReference,
            x.Amount,
            x.PrincipalPaid,
            x.InterestPaid,
            x.PaymentMethod,
            x.PaidAt,
            x.StatusId,
            StatusName = x.Status?.Name,
            StatusKey = x.Status?.Key,
            BorrowerUserId = x.Loan?.BorrowerUserId,
            BorrowerName = x.Loan?.BorrowerUser?.FullName,
            x.Remarks,
            x.CreatedAt
        }).ToList();

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);

        return new
        {
            message = "Repayments retrieved successfully.",
            data,
            totalRecords = total,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    public async Task<object> GetMyRepaymentsAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? statusKey = null)
    {
        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : Math.Min(pageSize, 100);

        var (items, total) = await _repository.GetPagedAsync(
            pageNumber, pageSize, null, statusKey, customerId: userId, null, null, null);

        var data = items.Select(x => new
        {
            x.Id,
            x.LoanId,
            LoanNumber = x.Loan?.LoanNumber,
            x.RepaymentScheduleId,
            x.PaymentReference,
            x.Amount,
            x.PrincipalPaid,
            x.InterestPaid,
            x.PaymentMethod,
            x.PaidAt,
            x.StatusId,
            StatusName = x.Status?.Name,
            StatusKey = x.Status?.Key,
            x.Remarks,
            x.CreatedAt
        }).ToList();

        var totalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);

        return new
        {
            message = "My repayments retrieved successfully.",
            data,
            totalRecords = total,
            pageNumber,
            pageSize,
            totalPages
        };
    }

    public async Task<object> GetByIdAsync(int userId, int repaymentId)
    {
        var (roleKey, _) = await GetValidatedUserAsync(userId);

        var repayment = await _repository.GetPaymentByIdAsync(repaymentId);
        if (repayment == null)
            throw new KeyNotFoundException("Payment not found.");

        if (roleKey == "CUSTOMER" && repayment.Loan?.BorrowerUserId != userId)
        {
            throw new UnauthorizedAccessException("You can only access your own repayments.");
        }

        return new
        {
            repayment.Id,
            repayment.LoanId,
            LoanNumber = repayment.Loan?.LoanNumber,
            repayment.RepaymentScheduleId,
            repayment.PaymentReference,
            repayment.Amount,
            repayment.PrincipalPaid,
            repayment.InterestPaid,
            repayment.PaymentMethod,
            repayment.PaidAt,
            repayment.StatusId,
            StatusName = repayment.Status?.Name,
            StatusKey = repayment.Status?.Key,
            BorrowerUserId = repayment.Loan?.BorrowerUserId,
            BorrowerName = repayment.Loan?.BorrowerUser?.FullName,
            repayment.Remarks,
            repayment.CreatedAt
        };
    }

    // Admin / Manager verifies payment
    public async Task VerifyAsync(
        int repaymentId,
        int verifierId,
        PaymentDecisionDto dto)
    {
        await _repository.BeginTransactionAsync();

        try
        {
            var verifier = await _repository.GetUserByIdAsync(verifierId);

            if (verifier == null ||
                (verifier.Role.Key != "ADMIN" &&
                 verifier.Role.Key != "MANAGER"))
            {
                throw new UnauthorizedAccessException(
                    "Only Admin or Head Manager can verify payments.");
            }

            var repayment =
                await _repository.GetPaymentByIdAsync(repaymentId);

            if (repayment == null)
                throw new KeyNotFoundException("Payment not found.");

            if (repayment.Status.Key != "REPAYMENT_PENDING")
                throw new InvalidOperationException(
                    "Only pending payments can be verified.");

            var schedule = repayment.RepaymentSchedule;

            if (schedule == null)
                throw new InvalidOperationException(
                    "Repayment schedule not found.");

            var completedPayments = schedule.Repayments
                .Where(x => x.Status.Key == "REPAYMENT_COMPLETED")
                .ToList();

            var remainingInterest = schedule.InterestDue -
                completedPayments.Sum(x => x.InterestPaid);

            var remainingPrincipal = schedule.PrincipalDue -
                completedPayments.Sum(x => x.PrincipalPaid);

            decimal interestToAllocate = 0;
            decimal principalToAllocate = 0;

            if (remainingInterest > 0)
            {
                interestToAllocate =
                    Math.Min(repayment.Amount, remainingInterest);
            }

            var leftover = repayment.Amount - interestToAllocate;

            if (leftover > 0 && remainingPrincipal > 0)
            {
                principalToAllocate =
                    Math.Min(leftover, remainingPrincipal);
            }

            repayment.InterestPaid = interestToAllocate;
            repayment.PrincipalPaid = principalToAllocate;

            var completedStatus =
                await _repository.GetStatusByKeyAsync(
                    "REPAYMENT_COMPLETED",
                    "Repayment");

            if (completedStatus == null)
                throw new KeyNotFoundException(
                    "Completed repayment status not found.");

            repayment.StatusId = completedStatus.Id;
            repayment.Remarks = string.IsNullOrWhiteSpace(dto.Remarks)
                ? repayment.Remarks
                : dto.Remarks.Trim();

            repayment.UpdatedAt = DateTime.UtcNow;
            repayment.UpdatedBy = verifierId;

            schedule.PaidAmount += repayment.Amount;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedBy = verifierId;

            if (schedule.PaidAmount >= schedule.TotalDue)
            {
                schedule.StatusId = completedStatus.Id;
                schedule.PaidAt = DateTime.UtcNow;
            }

            var loan = repayment.Loan;

            loan.OutstandingBalance -= repayment.Amount;
            loan.UpdatedAt = DateTime.UtcNow;
            loan.UpdatedBy = verifierId;

            if (loan.OutstandingBalance <= 0)
            {
                loan.OutstandingBalance = 0;

                var closedStatus =
                    await _repository.GetLoanStatusByKeyAsync("LOAN_CLOSED");

                if (closedStatus != null)
                {
                    loan.StatusId = closedStatus.Id;
                    loan.ClosedAt = DateTime.UtcNow;
                }
            }

            await _repository.SaveChangesAsync();
            await _repository.CommitTransactionAsync();
        }
        catch
        {
            await _repository.RollbackTransactionAsync();
            throw;
        }
    }

    // Admin / Manager rejects payment
    public async Task RejectAsync(
        int repaymentId,
        int verifierId,
        PaymentDecisionDto dto)
    {
        var verifier = await _repository.GetUserByIdAsync(verifierId);

        if (verifier == null ||
            (verifier.Role.Key != "ADMIN" &&
             verifier.Role.Key != "MANAGER"))
        {
            throw new UnauthorizedAccessException(
                "Only Admin or Head Manager can reject payments.");
        }

        var repayment =
            await _repository.GetPaymentByIdAsync(repaymentId);

        if (repayment == null)
            throw new KeyNotFoundException("Payment not found.");

        if (repayment.Status.Key != "REPAYMENT_PENDING")
            throw new InvalidOperationException(
                "Only pending payments can be rejected.");

        var failedStatus =
            await _repository.GetStatusByKeyAsync(
                "REPAYMENT_FAILED",
                "Repayment");

        if (failedStatus == null)
            throw new KeyNotFoundException(
                "Failed repayment status not found.");

        repayment.StatusId = failedStatus.Id;
        repayment.Remarks = string.IsNullOrWhiteSpace(dto.Remarks)
            ? repayment.Remarks
            : dto.Remarks.Trim();

        repayment.UpdatedAt = DateTime.UtcNow;
        repayment.UpdatedBy = verifierId;

        await _repository.SaveChangesAsync();
    }
}
