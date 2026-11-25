using LMS.Application.DTO.LoanApprovals;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanApprovalService : ILoanApprovalService
{
    private readonly ILoanApprovalRepository _repository;

    public LoanApprovalService(ILoanApprovalRepository repository)
    {
        _repository = repository;
    }

    // Approve or reject a loan application
    public async Task<int> DecideAsync(
        int applicationId,
        int decisionByUserId,
        bool isApproved,
        LoanApprovalDecisionDto dto)
    {
        // Validate decision-making user
        var decisionByUser = await _repository.GetUserByIdAsync(
            decisionByUserId);

        if (decisionByUser == null)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to make decisions on loan applications.");
        }

        // Only Manager or Admin can make approval decisions
        var roleKey = decisionByUser.Role.Key.ToUpperInvariant();

        if (roleKey != "ADMIN" && roleKey != "MANAGER")
        {
            throw new UnauthorizedAccessException(
                "Only Credit Managers and Administrators can approve or reject loan applications.");
        }

        // Validate application exists
        var application = await _repository.GetApplicationForDecisionAsync(
            applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException(
                "Loan application was not found.");
        }

        // Guarantor requirement check: If LoanType requires a guarantor, at least 1 must be verified
        if (isApproved && (application.LoanType?.RequiresGuarantor ?? false))
        {
            var hasVerifiedGuarantor = application.Guarantors != null &&
                application.Guarantors.Any(g =>
                    !g.IsDeleted &&
                    (g.Status?.Key == "GUARANTOR_VERIFIED" ||
                     g.Status?.Name?.ToLowerInvariant() == "verified"));

            if (!hasVerifiedGuarantor)
            {
                var totalGuarantors = application.Guarantors?.Count(g => !g.IsDeleted) ?? 0;
                if (totalGuarantors == 0)
                {
                    throw new InvalidOperationException(
                        $"This {application.LoanType?.Name ?? "loan"} product strictly requires at least one registered and verified guarantor before approval can be granted.");
                }
                else
                {
                    throw new InvalidOperationException(
                        "The registered guarantor for this loan application has not yet been verified. Guarantor verification is mandatory prior to loan approval.");
                }
            }
        }

        // Map status keys based on decision
        var applicationStatusKey = isApproved
            ? "APPLICATION_APPROVED"
            : "APPLICATION_REJECTED";

        var approvalStatusKey = isApproved
            ? "APPROVAL_APPROVED"
            : "APPROVAL_REJECTED";

        // Get application status
        var applicationStatus = await _repository.GetStatusByKeyAsync(
            applicationStatusKey,
            "Application");

        if (applicationStatus == null)
        {
            throw new InvalidOperationException(
                $"{applicationStatusKey} status is not configured.");
        }

        // Get approval history status
        var approvalStatus = await _repository.GetStatusByKeyAsync(
            approvalStatusKey,
            "Approval");

        if (approvalStatus == null)
        {
            throw new InvalidOperationException(
                $"{approvalStatusKey} status is not configured.");
        }

        var remarks = string.IsNullOrWhiteSpace(dto.Remarks)
            ? null
            : dto.Remarks.Trim();

        if (remarks?.Length > 1000)
        {
            throw new ArgumentException(
                "Remarks cannot exceed 1000 characters.");
        }

        // Application status: APPLICATION_APPROVED or APPLICATION_REJECTED
        application.StatusId = applicationStatus.Id;

        // Approval history status: APPROVAL_APPROVED or APPROVAL_REJECTED
        var approval = new LoanApproval
        {
            LoanApplicationId = applicationId,
            DecisionByUserId = decisionByUserId,
            StatusId = approvalStatus.Id,
            DecisionAt = DateTime.UtcNow,
            Remarks = dto.Remarks,
            CreatedBy = decisionByUserId
        };

        // When application is approved, auto-create the active Loan facility and repayment schedule
        // so the borrower immediately has their active loan visible and actionable in their portal.
        Loan? loan = null;
        if (isApproved)
        {
            var alreadyHasLoan = await _repository.HasExistingLoanAsync(applicationId);
            if (!alreadyHasLoan)
            {
                var loanActiveStatus = await _repository.GetStatusByKeyAsync("LOAN_ACTIVE", "Loan");
                if (loanActiveStatus != null)
                {
                    var interestRate = application.LoanType?.InterestRate ?? 10m;
                    var principalAmount = application.RequestedAmount;
                    var termMonths = application.RequestedTermMonths > 0 ? application.RequestedTermMonths : 12;

                    var interestAmount = principalAmount * (interestRate / 100m) * (termMonths / 12m);
                    var totalPayableAmount = decimal.Round(principalAmount + interestAmount, 2, MidpointRounding.AwayFromZero);

                    var loanNumber = $"LN-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

                    loan = new Loan
                    {
                        LoanNumber = loanNumber,
                        LoanApplicationId = application.Id,
                        BorrowerUserId = application.ApplicantUserId,
                        StatusId = loanActiveStatus.Id,
                        PrincipalAmount = principalAmount,
                        InterestRate = interestRate,
                        TermMonths = termMonths,
                        TotalPayableAmount = totalPayableAmount,
                        OutstandingBalance = totalPayableAmount,
                        DisbursedAt = DateTime.UtcNow,
                        DisbursedByUserId = decisionByUserId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = decisionByUserId,
                        IsDeleted = false
                    };

                    var pendingRepaymentStatus = await _repository.GetStatusByKeyAsync("REPAYMENT_PENDING", "Repayment");
                    if (pendingRepaymentStatus != null && termMonths > 0)
                    {
                        var monthlyPrincipal = decimal.Round(principalAmount / termMonths, 2, MidpointRounding.AwayFromZero);
                        var monthlyInterest = decimal.Round(interestAmount / termMonths, 2, MidpointRounding.AwayFromZero);
                        var monthlyTotal = monthlyPrincipal + monthlyInterest;
                        var firstDueDate = DateTime.UtcNow.AddMonths(1);

                        for (var i = 1; i <= termMonths; i++)
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
                                CreatedBy = decisionByUserId,
                                CreatedAt = DateTime.UtcNow,
                                IsDeleted = false
                            });
                        }
                    }
                }
            }
        }

        // Save application status, approval log, and new loan record in one atomic transaction
        return await _repository.SaveDecisionAsync(
            application,
            approval,
            loan);
    }
}
