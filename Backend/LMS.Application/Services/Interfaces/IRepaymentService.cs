using LMS.Application.DTO.Repayments;
using LMS.Domain.Entities;

namespace LMS.Application.Services.Interfaces;

public interface IRepaymentService
{
    Task<int> CreateAsync(
        int customerId,
        CreateRepaymentDto dto);

    Task<List<Repayment>> GetPendingPaymentsAsync();

    Task<object> GetPagedAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? search = null,
        string? statusKey = null,
        int? customerId = null,
        int? loanId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);

    Task<object> GetMyRepaymentsAsync(
        int userId,
        int pageNumber,
        int pageSize,
        string? statusKey = null);

    Task<object> GetByIdAsync(int userId, int repaymentId);

    Task VerifyAsync(
        int repaymentId,
        int verifierId,
        PaymentDecisionDto dto);

    Task RejectAsync(
        int repaymentId,
        int verifierId,
        PaymentDecisionDto dto);
}
