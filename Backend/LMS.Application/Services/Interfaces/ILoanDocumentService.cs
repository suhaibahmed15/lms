using LMS.Application.DTO.LoanDocuments;

namespace LMS.Application.Services.Interfaces;

public interface ILoanDocumentService
{
    Task<int> UploadAsync(int userId, CreateLoanDocumentDto dto);

    Task<List<LoanDocumentResponseDto>> GetByApplicationIdAsync(
        int userId,
        int applicationId);

    Task<LoanDocumentResponseDto> GetByIdAsync(
        int userId,
        int documentId);

    Task<(byte[] FileBytes, string ContentType, string FileName)> DownloadAsync(
        int userId,
        int documentId);

    Task VerifyAsync(
        int userId,
        int documentId,
        VerifyLoanDocumentDto dto);

    Task RejectAsync(
        int userId,
        int documentId,
        RejectLoanDocumentDto dto);
}
