
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
            throw new KeyNotFoundException(
                "Decision-making user not found or inactive.");
        }

        var roleKey = decisionByUser.Role.Key;

        if (!roleKey.Equals(
                "MANAGER",
                StringComparison.OrdinalIgnoreCase) &&
            !roleKey.Equals(
                "ADMIN",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException(
                "Only Manager or Admin can approve or reject loan applications.");
        }

        // Validate application
        var application =
            await _repository.GetApplicationForDecisionAsync(
                applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException(
                "Loan application not found.");
        }

        // Only reviewed applications can receive a final decision
        if (!application.Status.Key.Equals(
            "APPLICATION_UNDER_REVIEW",
            StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Only applications under review can be approved or rejected.");
        }

        // Select application and approval status keys
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

        // Save both changes in one transaction
        return await _repository.SaveDecisionAsync(
            application,
            approval);
    }
}
