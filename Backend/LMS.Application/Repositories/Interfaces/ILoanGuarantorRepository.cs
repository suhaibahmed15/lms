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

    Task<bool> ExistsByNationalIdOrPhoneAsync(
        int applicationId,
        string? nationalId,
        string phoneNumber,
        int? excludeGuarantorId = null);

    Task<User?> GetUserWithRoleAsync(int userId);

    Task AddAsync(LoanGuarantor guarantor);

    Task SaveChangesAsync();
}
