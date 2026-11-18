using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanDocumentRepository
{
    Task<LoanApplication?> GetApplicationByIdAsync(int applicationId);

    Task<bool> DocumentExistsAsync(
        int applicationId,
        int userId,
        string documentType);

    Task<List<LoanDocument>> GetDocumentsByApplicationIdAsync(
        int applicationId);
    Task<LoanDocument?> GetDocumentByIdAsync(int documentId);

    Task SaveChangesAsync();

    Task AddAsync(LoanDocument document);

  
}