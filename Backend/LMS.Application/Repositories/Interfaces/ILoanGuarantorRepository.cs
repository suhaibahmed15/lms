
using LMS.Domain.Entities;

namespace LMS.Application.Repositories.Interfaces;

public interface ILoanGuarantorRepository
{
    Task<LoanApplication?> GetApplicationByIdAsync(int applicationId);

    Task<Status?> GetStatusByCategoryAndKeyAsync(
        string category,
        string key);

    Task<List<LoanGuarantor>> GetByApplicationIdAsync(
        int applicationId);

    Task<LoanGuarantor?> GetByIdAsync(int guarantorId);

    Task AddAsync(LoanGuarantor guarantor);

    Task SaveChangesAsync();
}
