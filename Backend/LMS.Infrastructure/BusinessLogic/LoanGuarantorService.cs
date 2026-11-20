
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

    public LoanGuarantorService(
        ILoanGuarantorRepository repository)
    {
        _repository = repository;
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

        var application = await _repository.GetApplicationByIdAsync(
            dto.LoanApplicationId);

        if (application == null)
            throw new KeyNotFoundException("Loan application not found.");

        if (application.ApplicantUserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only add guarantors to your own loan application.");
        }

        var pendingStatus =
            await _repository.GetStatusByCategoryAndKeyAsync(
                GuarantorCategory,
                PendingStatus);

        if (pendingStatus == null)
        {
            throw new InvalidOperationException(
                "Guarantor Pending status was not found or is inactive.");
        }

        var guarantor = new LoanGuarantor
        {
            LoanApplicationId = dto.LoanApplicationId,
            StatusId = pendingStatus.Id,

            FullName = dto.FullName.Trim(),
            NationalIdNumber = dto.NationalIdNumber?.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Email = dto.Email?.Trim(),
            RelationshipToApplicant =
                dto.RelationshipToApplicant?.Trim(),
            Address = dto.Address?.Trim()
        };

        await _repository.AddAsync(guarantor);
        await _repository.SaveChangesAsync();

        return guarantor.Id;
    }

    // GET: Get guarantors by application
    public async Task<List<LoanGuarantorResponseDto>>
        GetByApplicationIdAsync(int userId, int applicationId)
    {
        var application = await _repository.GetApplicationByIdAsync(
            applicationId);

        if (application == null)
            throw new KeyNotFoundException("Loan application not found.");

        if (application.ApplicantUserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You can only view guarantors of your own loan application.");
        }

        var guarantors = await _repository.GetByApplicationIdAsync(
            applicationId);

        return guarantors.Select(g => new LoanGuarantorResponseDto
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

        }).ToList();
    }

    // PUT: Verify guarantor
    public async Task VerifyAsync(
        int userId,
        int guarantorId,
        VerifyLoanGuarantorDto dto)
    {
        var guarantor = await _repository.GetByIdAsync(guarantorId);

        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        if (guarantor.Status.Key != PendingStatus)
        {
            throw new InvalidOperationException(
                "Only pending guarantors can be verified.");
        }

        var verifiedStatus =
            await _repository.GetStatusByCategoryAndKeyAsync(
                GuarantorCategory,
                VerifiedStatus);

        if (verifiedStatus == null)
        {
            throw new InvalidOperationException(
                "Guarantor Verified status was not found or is inactive.");
        }

        guarantor.StatusId = verifiedStatus.Id;

        guarantor.VerifiedByUserId = userId;
        guarantor.VerifiedAt = DateTime.UtcNow;
        guarantor.VerificationRemarks =
            dto.VerificationRemarks?.Trim();

        await _repository.SaveChangesAsync();
    }

    // PUT: Reject guarantor
    public async Task RejectAsync(
        int userId,
        int guarantorId,
        RejectLoanGuarantorDto dto)
    {
        var guarantor = await _repository.GetByIdAsync(guarantorId);

        if (guarantor == null)
            throw new KeyNotFoundException("Loan guarantor not found.");

        if (guarantor.Status.Key != PendingStatus)
        {
            throw new InvalidOperationException(
                "Only pending guarantors can be rejected.");
        }

        var remarks = dto.RejectionRemarks?.Trim();

        if (string.IsNullOrWhiteSpace(remarks))
        {
            throw new ArgumentException(
                "Rejection remarks are required.");
        }

        var rejectedStatus =
            await _repository.GetStatusByCategoryAndKeyAsync(
                GuarantorCategory,
                RejectedStatus);

        if (rejectedStatus == null)
        {
            throw new InvalidOperationException(
                "Guarantor Rejected status was not found or is inactive.");
        }

        guarantor.StatusId = rejectedStatus.Id;

        guarantor.RejectedByUserId = userId;
        guarantor.RejectedAt = DateTime.UtcNow;
        guarantor.RejectionRemarks = remarks;

        await _repository.SaveChangesAsync();
    }
}
