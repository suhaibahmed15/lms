
using LMS.Application.DTO.LoanApplications;

namespace LMS.Application.Services.Interfaces;

public interface ILoanApplicationService
{
    Task<int> CreateAsync(
        int userId,
        CreateLoanApplicationDto dto);

    Task<List<LoanApplicationResponseDto>> GetAllAsync(int userId);

    Task<object> GetPagedAsync(int userId);

    Task ReviewAsync(
        int applicationId,
        int officerId,
        ReviewLoanApplicationDto dto);
}
