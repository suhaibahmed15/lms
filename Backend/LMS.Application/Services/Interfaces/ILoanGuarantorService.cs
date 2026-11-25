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

    Task<LoanGuarantorResponseDto> GetByIdAsync(
        int userId,
        int guarantorId);

    Task UpdateAsync(
        int userId,
        int guarantorId,
        UpdateLoanGuarantorDto dto);

    Task DeleteAsync(
        int userId,
        int guarantorId);

    Task VerifyAsync(
        int userId,
        int guarantorId,
        VerifyLoanGuarantorDto dto);

    Task RejectAsync(
        int userId,
        int guarantorId,
        RejectLoanGuarantorDto dto);
}
