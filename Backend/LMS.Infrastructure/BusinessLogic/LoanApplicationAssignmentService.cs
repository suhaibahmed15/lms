
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanApplicationAssignmentService
    : ILoanApplicationAssignmentService
{
    private readonly ILoanApplicationAssignmentRepository _repository;

    public LoanApplicationAssignmentService(
        ILoanApplicationAssignmentRepository repository)
    {
        _repository = repository;
    }

    // Assign or reassign application to a Loan Officer
    public async Task<int> AssignAsync(
        int applicationId,
        int assignedToUserId,
        int assignedByUserId)
    {
        // Validate Manager/Admin
        var assigningUser = await _repository.GetUserByIdAsync(
            assignedByUserId);

        if (assigningUser == null)
        {
            throw new KeyNotFoundException(
                "Assigning user not found or inactive.");
        }

        var assigningRole = assigningUser.Role.Key;

        if (!assigningRole.Equals(
                "MANAGER",
                StringComparison.OrdinalIgnoreCase) &&
            !assigningRole.Equals(
                "ADMIN",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException(
                "Only Managers or Admin can assign loan applications.");
        }

        // Validate Loan Officer
        var officer = await _repository.GetActiveLoanOfficerByIdAsync(
            assignedToUserId);

        if (officer == null)
        {
            throw new KeyNotFoundException(
                "Active Loan Officer not found.");
        }

        // Get application
        var application =
            await _repository.GetApplicationForAssignmentAsync(
                applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException(
                "Loan application not found.");
        }

        // Validate current application status
        var currentStatus = application.Status.Key;

        if (currentStatus == "APPLICATION_APPROVED" ||
            currentStatus == "APPLICATION_REJECTED" ||
            currentStatus == "APPLICATION_CANCELLED")
        {
            throw new InvalidOperationException(
                "Approved, rejected or cancelled applications cannot be assigned.");
        }

        // Prevent duplicate assignment to the same Officer
        if (application.AssignedToUserId == assignedToUserId)
        {
            throw new InvalidOperationException(
                "This application is already assigned to the selected Loan Officer.");
        }

        // Create assignment history
        var assignment = new LoanApplicationAssignment
        {
            LoanApplicationId = applicationId,
            AssignedToUserId = assignedToUserId,
            AssignedByUserId = assignedByUserId,
            AssignedAt = DateTime.UtcNow,
            CreatedBy = assignedByUserId
        };

        // Update application and save assignment history
        return await _repository.AssignAsync(
            application,
            assignment);
    }
}
