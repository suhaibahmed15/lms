using LMS.Application.DTO.LoanDocuments;

namespace LMS.Application.Services.Interfaces;

public interface ILoanDocumentService
{
    Task<int> UploadAsync(int userId, CreateLoanDocumentDto dto);

    Task<List<LoanDocumentResponseDto>> GetByApplicationIdAsync(
        int userId,
        int applicationId);

    Task VerifyAsync(
        int userId,
        int documentId,
        VerifyLoanDocumentDto dto);
}