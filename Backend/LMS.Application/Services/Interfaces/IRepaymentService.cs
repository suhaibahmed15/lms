using LMS.Application.DTO.Repayments;
using LMS.Domain.Entities;

namespace LMS.Application.Services.Interfaces;

public interface IRepaymentService
{
    Task<int> CreateAsync(
        int customerId,
        CreateRepaymentDto dto);

    Task<List<Repayment>> GetPendingPaymentsAsync();

    Task VerifyAsync(
        int repaymentId,
        int verifierId,
        PaymentDecisionDto dto);

    Task RejectAsync(
        int repaymentId,
        int verifierId,
        PaymentDecisionDto dto);
}