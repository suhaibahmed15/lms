using LMS.Application.DTO.Repayments;

namespace LMS.Application.Services.Interfaces;

public interface IRepaymentScheduleService
{
    Task<int> GenerateAsync(
        int loanId,
        int userId,
        GenerateRepaymentScheduleDto dto);

    Task<List<object>> GetByLoanIdAsync(int userId, int loanId);
}
