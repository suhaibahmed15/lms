using LMS.Application.DTO.Loans;

namespace LMS.Application.Services.Interfaces;

public interface ILoanService
{
    Task<object> GetPagedAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null);

    Task<LoanDetailsDto> GetByIdAsync(int userId, int loanId);

    Task<object> GetMyLoansAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? statusKey = null);

    Task<List<LoanScheduleItemDto>> GetRepaymentScheduleAsync(int userId, int loanId);

    Task<List<LoanRepaymentItemDto>> GetRepaymentHistoryAsync(int userId, int loanId);
}
