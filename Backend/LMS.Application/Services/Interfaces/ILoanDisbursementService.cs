
using LMS.Application.DTO.Loans;

namespace LMS.Application.Services.Interfaces;

public interface ILoanDisbursementService
{
    Task<int> DisburseAsync(
        int applicationId,
        int disbursedByUserId,
        DisburseLoanDto dto);
}
 