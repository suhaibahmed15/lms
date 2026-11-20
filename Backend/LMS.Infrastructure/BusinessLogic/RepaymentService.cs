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

    // Customer submits a payment
    public async Task<int> CreateAsync(
        int customerId,
        CreateRepaymentDto dto)
    {
        var customer = await _repository.GetUserByIdAsync(customerId);

        if (customer == null ||
            customer.Role.Key != "CUSTOMER")
        {
            throw new UnauthorizedAccessException(
                "Only active customers can submit payments.");
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

        var schedule =
            await _repository.GetScheduleForCustomerAsync(
                dto.RepaymentScheduleId,
                customerId);

        if (schedule == null)
            throw new KeyNotFoundException(
                "Repayment schedule not found for this customer.");

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
            RecordedByUserId = customerId,
            Remarks = dto.Remarks?.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = customerId,
            IsDeleted = false
        };

        return await _repository.CreateAsync(repayment);
    }

    // Admin / Manager views pending payments
    public async Task<List<Repayment>> GetPendingPaymentsAsync()
    {
        return await _repository.GetPendingPaymentsAsync();
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

            // Allocate payment to interest first, then principal.
            var interestPaid = Math.Min(
                repayment.Amount,
                remainingInterest);

            var principalPaid = repayment.Amount - interestPaid;

            if (principalPaid > remainingPrincipal)
                throw new InvalidOperationException(
                    "Payment allocation exceeds the remaining installment.");

            var completedStatus =
                await _repository.GetStatusByKeyAsync(
                    "REPAYMENT_COMPLETED",
                    "Repayment");

            if (completedStatus == null)
                throw new KeyNotFoundException(
                    "Completed repayment status not found.");

            repayment.StatusId = completedStatus.Id;
            repayment.InterestPaid = interestPaid;
            repayment.PrincipalPaid = principalPaid;
            repayment.UpdatedAt = DateTime.UtcNow;
            repayment.UpdatedBy = verifierId;

            if (!string.IsNullOrWhiteSpace(dto.Remarks))
                repayment.Remarks = dto.Remarks.Trim();

            schedule.PaidAmount += repayment.Amount;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.UpdatedBy = verifierId;

            if (schedule.PaidAmount >= schedule.TotalDue)
            {
                schedule.PaidAmount = schedule.TotalDue;
                schedule.StatusId = completedStatus.Id;
                schedule.PaidAt = DateTime.UtcNow;
            }

            repayment.Loan.OutstandingBalance -= repayment.Amount;

            if (repayment.Loan.OutstandingBalance <= 0)
            {
                repayment.Loan.OutstandingBalance = 0;

                var closedStatus =
                    await _repository.GetLoanStatusByKeyAsync("LOAN_CLOSED");

                if (closedStatus == null)
                    throw new KeyNotFoundException(
                        "Closed loan status not found.");

                repayment.Loan.StatusId = closedStatus.Id;
                repayment.Loan.ClosedAt = DateTime.UtcNow;
            }

            repayment.Loan.UpdatedAt = DateTime.UtcNow;
            repayment.Loan.UpdatedBy = verifierId;

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
        await _repository.BeginTransactionAsync();

        try
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
            repayment.UpdatedAt = DateTime.UtcNow;
            repayment.UpdatedBy = verifierId;

            if (!string.IsNullOrWhiteSpace(dto.Remarks))
                repayment.Remarks = dto.Remarks.Trim();

            await _repository.SaveChangesAsync();

            await _repository.CommitTransactionAsync();
        }
        catch
        {
            await _repository.RollbackTransactionAsync();
            throw;
        }
    }
}