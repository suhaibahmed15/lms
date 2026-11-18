
using LMS.Application.DTO.LoanApplications;

namespace LMS.Application.Services.Interfaces;

public interface ILoanApplicationService
{
    // Create new loan application
    Task<int> CreateAsync(int userId, CreateLoanApplicationDto dto);

    // Get loan applications according to logged-in user's role
    Task<List<LoanApplicationResponseDto>> GetAllAsync(int userId);

    Task<object> GetPagedAsync(int userId);
}
