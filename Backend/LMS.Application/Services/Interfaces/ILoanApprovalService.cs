
using LMS.Application.DTO.LoanApprovals;

namespace LMS.Application.Services.Interfaces;

public interface ILoanApprovalService
{
    Task<int> DecideAsync(
        int applicationId,
        int decisionByUserId,
        bool isApproved,
        LoanApprovalDecisionDto dto);
}
 