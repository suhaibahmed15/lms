
namespace LMS.Application.Services.Interfaces;

public interface ILoanApplicationAssignmentService
{
    Task<int> AssignAsync(
        int applicationId,
        int assignedToUserId,
        int assignedByUserId);
}
