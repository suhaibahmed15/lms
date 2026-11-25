using LMS.Application.DTO.LoanGuarantors;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanGuarantorService : ILoanGuarantorService
{
    private readonly ILoanGuarantorRepository _repository;

    private const string GuarantorCategory = "Guarantor";
    private const string PendingStatus = "GUARANTOR_PENDING";
    private const string VerifiedStatus = "GUARANTOR_VERIFIED";
    private const string RejectedStatus = "GUARANTOR_REJECTED";

    public LoanGuarantorService(ILoanGuarantorRepository repository)
    {
        _repository = repository;
    }

    private async Task ValidateGuarantorAccessAsync(int userId, LoanApplication application)
    {
        if (application.ApplicantUserId == userId)
            return;

        var user = await _repository.GetUserWithRoleAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found or inactive.");

        var roleKey = user.Role.Key.ToUpperInvariant();
        if (roleKey == "ADMIN" || roleKey == "MANAGER")
            return;

        if (roleKey == "OFFICER" || roleKey == "LOAN_OFFICER")
        {
            if (application.AssignedToUserId == userId || application.AssignedToUserId == null)
                return;
        }

        throw new UnauthorizedAccessException("You are not authorized to view guarantors for this loan application.");
    }

    private async Task ValidateGuarantorManageAccessAsync(int userId, LoanApplication application)
    {
        if (application.ApplicantUserId == userId)
            return;

        var user = await _repository.GetUserWithRoleAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found or inactive.");

        var roleKey = user.Role.Key.ToUpperInvariant();
        if (roleKey == "ADMIN")
            return;

        throw new UnauthorizedAccessException("You are not authorized to modify guarantors for this loan application.");
    }

    // POST: Create guarantor
    public async Task<int> CreateAsync(
        int userId,
        CreateLoanGuarantorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("Guarantor name is required.");

        if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
            throw new ArgumentException("Phone number is required.");

        var application = await _repository.GetApplicationByIdAsync(dto.LoanApplicationId);

        if (application == null)
            throw new KeyNotFoundException("Loan application not found.");

        await ValidateGuarantorManageAccessAsync(userId, application);

        var isDuplicate = await _repository.ExistsByNationalIdOrPhoneAsync(
            dto.LoanApplicationId,
            dto.NationalIdNumber,
            dto.PhoneNumber);

        if (isDuplicate)
        {
            throw new InvalidOperationException("A guarantor with the same phone number or national ID already exists for this application.");
        }

        var pendingStatus = await _repository.GetStatusByCategoryAndKeyAsync(
            GuarantorCategory,
            PendingStatus);

        if (pendingStatus == null)
        {
            throw new InvalidOperationException("Guarantor Pending status was not found or is inactive.");
        }

        var guarantor = new LoanGuarantor
        {
            LoanApplicationId = dto.LoanApplicationId,
            StatusId = pendingStatus.Id,
            FullName = dto.FullName.Trim(),
            NationalIdNumber = dto.NationalIdNumber?.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Email = dto.Email?.Trim(),
            RelationshipToApplicant = dto.RelationshipToApplicant?.Trim(),
            Address = dto.Address?.Trim()
        };

        await _repository.AddAsync(guarantor);
        await _repository.SaveChangesAsync();

        return guarantor.Id;
    }

    // GET: Get guarantors by application
    public async Task<List<LoanGuarantorResponseDto>> GetByApplicationIdAsync(int userId, int applicationId)
    {
        var application = await _repository.GetApplicationByIdAsync(applicationId);

        if (application == null)
            throw new KeyNotFoundException("Loan application not found.");

        await ValidateGuarantorAccessAsync(userId, application);

        var guarantors = await _repository.GetByApplicationIdAsync(applicationId);

        return guarantors.Select(MapToResponseDto).ToList();
    }

    // GET: Get guarantor by ID
    public async Task<LoanGuarantorResponseDto> GetByIdAsync(int userId, int guarantorId)
    {
        var guarantor = await _repository.GetByIdAsync(guarantorId);

        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        var application = await _repository.GetApplicationByIdAsync(guarantor.LoanApplicationId);
        if (application == null)
            throw new KeyNotFoundException("Associated loan application not found.");

        await ValidateGuarantorAccessAsync(userId, application);

        return MapToResponseDto(guarantor);
    }

    // PUT: Update guarantor details
    public async Task UpdateAsync(int userId, int guarantorId, UpdateLoanGuarantorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("Guarantor name is required.");

        if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
            throw new ArgumentException("Phone number is required.");

        var guarantor = await _repository.GetByIdAsync(guarantorId);
        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        var application = await _repository.GetApplicationByIdAsync(guarantor.LoanApplicationId);
        if (application == null)
            throw new KeyNotFoundException("Associated loan application not found.");

        await ValidateGuarantorManageAccessAsync(userId, application);

        var isDuplicate = await _repository.ExistsByNationalIdOrPhoneAsync(
            guarantor.LoanApplicationId,
            dto.NationalIdNumber,
            dto.PhoneNumber,
            guarantorId);

        if (isDuplicate)
        {
            throw new InvalidOperationException("Another guarantor on this application already uses this phone number or national ID.");
        }

        guarantor.FullName = dto.FullName.Trim();
        guarantor.NationalIdNumber = dto.NationalIdNumber?.Trim();
        guarantor.PhoneNumber = dto.PhoneNumber.Trim();
        guarantor.Email = dto.Email?.Trim();
        guarantor.RelationshipToApplicant = dto.RelationshipToApplicant?.Trim();
        guarantor.Address = dto.Address?.Trim();
        guarantor.UpdatedAt = DateTime.UtcNow;
        guarantor.UpdatedBy = userId;

        await _repository.SaveChangesAsync();
    }

    // DELETE: Soft-delete guarantor
    public async Task DeleteAsync(int userId, int guarantorId)
    {
        var guarantor = await _repository.GetByIdAsync(guarantorId);
        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        var application = await _repository.GetApplicationByIdAsync(guarantor.LoanApplicationId);
        if (application == null)
            throw new KeyNotFoundException("Associated loan application not found.");

        await ValidateGuarantorManageAccessAsync(userId, application);

        guarantor.IsDeleted = true;
        guarantor.UpdatedAt = DateTime.UtcNow;
        guarantor.UpdatedBy = userId;

        await _repository.SaveChangesAsync();
    }

    // PUT: Verify guarantor
    public async Task VerifyAsync(
        int userId,
        int guarantorId,
        VerifyLoanGuarantorDto dto)
    {
        var user = await _repository.GetUserWithRoleAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found or inactive.");

        var roleKey = user.Role.Key.ToUpperInvariant();
        if (roleKey != "ADMIN" && roleKey != "MANAGER" && roleKey != "OFFICER" && roleKey != "LOAN_OFFICER")
            throw new UnauthorizedAccessException("Only Admin, Manager, or Loan Officer can verify guarantors.");

        var guarantor = await _repository.GetByIdAsync(guarantorId);

        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        if (guarantor.Status.Key != PendingStatus)
        {
            throw new InvalidOperationException("Only pending guarantors can be verified.");
        }

        var verifiedStatus = await _repository.GetStatusByCategoryAndKeyAsync(
            GuarantorCategory,
            VerifiedStatus);

        if (verifiedStatus == null)
        {
            throw new InvalidOperationException("Guarantor Verified status was not found or is inactive.");
        }

        guarantor.StatusId = verifiedStatus.Id;
        guarantor.VerifiedByUserId = userId;
        guarantor.VerifiedAt = DateTime.UtcNow;
        guarantor.VerificationRemarks = dto.VerificationRemarks?.Trim();
        guarantor.UpdatedAt = DateTime.UtcNow;
        guarantor.UpdatedBy = userId;

        await _repository.SaveChangesAsync();
    }

    // PUT: Reject guarantor
    public async Task RejectAsync(
        int userId,
        int guarantorId,
        RejectLoanGuarantorDto dto)
    {
        var user = await _repository.GetUserWithRoleAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found or inactive.");

        var roleKey = user.Role.Key.ToUpperInvariant();
        if (roleKey != "ADMIN" && roleKey != "MANAGER" && roleKey != "OFFICER" && roleKey != "LOAN_OFFICER")
            throw new UnauthorizedAccessException("Only Admin, Manager, or Loan Officer can reject guarantors.");

        var guarantor = await _repository.GetByIdAsync(guarantorId);

        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        if (guarantor.Status.Key != PendingStatus)
        {
            throw new InvalidOperationException("Only pending guarantors can be rejected.");
        }

        var remarks = dto.RejectionRemarks?.Trim();

        if (string.IsNullOrWhiteSpace(remarks))
        {
            throw new ArgumentException("Rejection remarks are required.");
        }

        var rejectedStatus = await _repository.GetStatusByCategoryAndKeyAsync(
            GuarantorCategory,
            RejectedStatus);

        if (rejectedStatus == null)
        {
            throw new InvalidOperationException("Guarantor Rejected status was not found or is inactive.");
        }

        guarantor.StatusId = rejectedStatus.Id;
        guarantor.RejectedByUserId = userId;
        guarantor.RejectedAt = DateTime.UtcNow;
        guarantor.RejectionRemarks = remarks;
        guarantor.UpdatedAt = DateTime.UtcNow;
        guarantor.UpdatedBy = userId;

        await _repository.SaveChangesAsync();
    }

    private static LoanGuarantorResponseDto MapToResponseDto(LoanGuarantor g)
    {
        return new LoanGuarantorResponseDto
        {
            Id = g.Id,
            LoanApplicationId = g.LoanApplicationId,
            FullName = g.FullName,
            NationalIdNumber = g.NationalIdNumber,
            PhoneNumber = g.PhoneNumber,
            Email = g.Email,
            RelationshipToApplicant = g.RelationshipToApplicant,
            Address = g.Address,
            StatusId = g.StatusId,
            StatusName = g.Status.Name,
            StatusKey = g.Status.Key,
            VerifiedByUserId = g.VerifiedByUserId,
            VerifiedAt = g.VerifiedAt,
            VerificationRemarks = g.VerificationRemarks,
            RejectedByUserId = g.RejectedByUserId,
            RejectedAt = g.RejectedAt,
            RejectionRemarks = g.RejectionRemarks,
            CreatedAt = g.CreatedAt
        };
    }
}
