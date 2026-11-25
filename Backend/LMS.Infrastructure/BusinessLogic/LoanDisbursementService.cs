
using LMS.Application.DTO.Loans;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanDisbursementService : ILoanDisbursementService
{
    private readonly ILoanDisbursementRepository _repository;

    public LoanDisbursementService(
        ILoanDisbursementRepository repository)
    {
        _repository = repository;
    }

    public async Task<int> DisburseAsync(
        int applicationId,
        int disbursedByUserId,
        DisburseLoanDto dto)
    {
        // Validate the user performing disbursement
        var disbursingUser =
            await _repository.GetUserByIdAsync(disbursedByUserId);

        if (disbursingUser == null)
        {
            throw new KeyNotFoundException(
                "Disbursing user not found or inactive.");
        }

        // Only Admin and Manager can disburse loans
        var roleKey = disbursingUser.Role.Key;

        if (!roleKey.Equals(
                "ADMIN",
                StringComparison.OrdinalIgnoreCase) &&
            !roleKey.Equals(
                "MANAGER",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException(
                "Only Admin or Manager can disburse loans.");
        }

        // Validate interest rate
        if (dto.InterestRate < 0 || dto.InterestRate > 100)
        {
            throw new ArgumentException(
                "Interest rate must be between 0 and 100.");
        }

        // Get approved application
        var application =
            await _repository.GetApprovedApplicationAsync(applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException(
                "Approved loan application not found.");
        }

        // Prevent duplicate loan creation
        var loanExists =
            await _repository.LoanExistsForApplicationAsync(applicationId);

        if (loanExists)
        {
            throw new InvalidOperationException(
                "A loan has already been created for this application.");
        }

        // Validate application financial details
        if (application.RequestedAmount <= 0)
        {
            throw new InvalidOperationException(
                "Application amount must be greater than zero.");
        }

        if (application.RequestedTermMonths <= 0)
        {
            throw new InvalidOperationException(
                "Application term must be greater than zero.");
        }

        // Get initial Loan status
        var loanStatus = await _repository.GetStatusByKeyAsync(
            "LOAN_ACTIVE",
            "Loan");

        if (loanStatus == null)
        {
            throw new KeyNotFoundException(
                "Active Loan status was not found.");
        }

        // Calculate flat annual interest
        var principalAmount = application.RequestedAmount;

        var interestAmount =
            principalAmount *
            (dto.InterestRate / 100m) *
            (application.RequestedTermMonths / 12m);

        var totalPayableAmount = decimal.Round(
            principalAmount + interestAmount,
            2,
            MidpointRounding.AwayFromZero);

        // Generate unique loan number
        var loanNumber =
            $"LN-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

        // Create Loan record
        var loan = new Loan
        {
            LoanNumber = loanNumber,
            LoanApplicationId = application.Id,
            BorrowerUserId = application.ApplicantUserId,
            StatusId = loanStatus.Id,

            PrincipalAmount = principalAmount,
            InterestRate = dto.InterestRate,
            TermMonths = application.RequestedTermMonths,

            TotalPayableAmount = totalPayableAmount,
            OutstandingBalance = totalPayableAmount,

            DisbursedAt = DateTime.UtcNow,
            DisbursedByUserId = disbursingUser.Id,

            CreatedAt = DateTime.UtcNow,
            CreatedBy = disbursingUser.Id,
            IsDeleted = false
        };

        // Automatically generate repayment schedule for the disbursed loan
        var pendingRepaymentStatus = await _repository.GetStatusByKeyAsync(
            "REPAYMENT_PENDING",
            "Repayment");

        if (pendingRepaymentStatus != null && application.RequestedTermMonths > 0)
        {
            var monthlyPrincipal = decimal.Round(
                principalAmount / application.RequestedTermMonths,
                2,
                MidpointRounding.AwayFromZero);

            var monthlyInterest = decimal.Round(
                interestAmount / application.RequestedTermMonths,
                2,
                MidpointRounding.AwayFromZero);

            var monthlyTotal = monthlyPrincipal + monthlyInterest;
            var firstDueDate = DateTime.UtcNow.AddMonths(1);

            for (var i = 1; i <= application.RequestedTermMonths; i++)
            {
                loan.RepaymentSchedules.Add(new RepaymentSchedule
                {
                    InstallmentNumber = i,
                    DueDate = firstDueDate.AddMonths(i - 1),
                    PrincipalDue = monthlyPrincipal,
                    InterestDue = monthlyInterest,
                    TotalDue = monthlyTotal,
                    PaidAmount = 0m,
                    StatusId = pendingRepaymentStatus.Id,
                    CreatedBy = disbursingUser.Id,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                });
            }
        }

        // Save Loan
        return await _repository.CreateLoanAsync(loan);
    }
}
