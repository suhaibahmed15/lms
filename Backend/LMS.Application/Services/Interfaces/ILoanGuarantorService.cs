
using LMS.Application.DTO.LoanGuarantors;

namespace LMS.Application.Services.Interfaces;

public interface ILoanGuarantorService
{
    Task<int> CreateAsync(
        int userId,
        CreateLoanGuarantorDto dto);

    Task<List<LoanGuarantorResponseDto>> GetByApplicationIdAsync(
        int userId,
        int applicationId);

    Task VerifyAsync(
        int userId,
        int guarantorId,
        VerifyLoanGuarantorDto dto);

    Task RejectAsync(
        int userId,
        int guarantorId,
        RejectLoanGuarantorDto dto);
}
