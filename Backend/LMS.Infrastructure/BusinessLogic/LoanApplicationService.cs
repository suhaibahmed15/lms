
using LMS.Application.DTO.LoanApplications;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanApplicationService : ILoanApplicationService
{
    private readonly ILoanApplicationRepository _repository;

    public LoanApplicationService(ILoanApplicationRepository repository)
    {
        _repository = repository;
    }

    // Create new loan application
    public async Task<int> CreateAsync(int userId, CreateLoanApplicationDto dto)
    {
        var user = await _repository.GetUserByIdAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found or inactive.");
        }

        if (user.Role.Key != "CUSTOMER")
        {
            throw new UnauthorizedAccessException(
                "Only customers can submit loan applications.");
        }

        if (dto.RequestedAmount <= 0)
        {
            throw new ArgumentException(
                "Requested amount must be greater than zero.");
        }

        if (dto.RequestedTermMonths <= 0)
        {
            throw new ArgumentException(
                "Requested term must be greater than zero.");
        }

        var loanType = await _repository.GetActiveLoanTypeByIdAsync(
            dto.LoanTypeId);

        if (loanType == null)
        {
            throw new KeyNotFoundException(
                "Loan type not found or inactive.");
        }

        if (dto.RequestedAmount < loanType.MinAmount ||
            dto.RequestedAmount > loanType.MaxAmount)
        {
            throw new ArgumentException(
                $"Requested amount must be between {loanType.MinAmount} and {loanType.MaxAmount}.");
        }

        if (dto.RequestedTermMonths < loanType.MinTermMonths ||
            dto.RequestedTermMonths > loanType.MaxTermMonths)
        {
            throw new ArgumentException(
                $"Loan term must be between {loanType.MinTermMonths} and {loanType.MaxTermMonths} months.");
        }

        var status = await _repository.GetStatusByKeyAsync(
            "APPLICATION_SUBMITTED");

        if (status == null)
        {
            throw new InvalidOperationException(
                "APPLICATION_SUBMITTED status is not configured.");
        }

        var application = new LoanApplication
        {
            ApplicationNumber =
                $"LA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",

            ApplicantUserId = userId,
            LoanTypeId = dto.LoanTypeId,
            StatusId = status.Id,
            RequestedAmount = dto.RequestedAmount,
            RequestedTermMonths = dto.RequestedTermMonths,
            Purpose = string.IsNullOrWhiteSpace(dto.Purpose)
                ? null
                : dto.Purpose.Trim(),
            SubmittedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        await _repository.AddAsync(application);
        await _repository.SaveChangesAsync();

        return application.Id;
    }

    // Get loan applications according to logged-in user's role
    public async Task<List<LoanApplicationResponseDto>> GetAllAsync(int userId)
    {
        var user = await _repository.GetUserByIdAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found or inactive.");
        }

        var applications = await _repository.GetAllAsync();

        // Admin can see all applications
        if (user.Role.Key == "ADMIN")
        {
            // No filtering required
        }
        // Branch Manager can see all applications assigned to them
        // including applications delegated to Loan Officers
        else if (user.Role.Key == "MANAGER")
        {
            applications = applications
                .Where(a => a.Assignments.Any(
                    assignment => assignment.AssignedToUserId == userId))
                .ToList();
        }
        // Loan Officer can see currently assigned applications
        else if (user.Role.Key == "LOAN_OFFICER")
        {
            applications = applications
                .Where(a => a.AssignedToUserId == userId)
                .ToList();
        }
        // Customer can see only their own applications
        else if (user.Role.Key == "CUSTOMER")
        {
            applications = applications
                .Where(a => a.ApplicantUserId == userId)
                .ToList();
        }
        else
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to view loan applications.");
        }

        // Convert entities into response DTOs
        return applications.Select(a => new LoanApplicationResponseDto
        {
            Id = a.Id,
            ApplicationNumber = a.ApplicationNumber,

            ApplicantUserId = a.ApplicantUserId,
            ApplicantName = a.ApplicantUser.FullName,

            LoanTypeId = a.LoanTypeId,
            LoanTypeName = a.LoanType.Name,

            StatusId = a.StatusId,
            StatusName = a.Status.Name,
            StatusKey = a.Status.Key,

            RequestedAmount = a.RequestedAmount,
            RequestedTermMonths = a.RequestedTermMonths,

            Purpose = a.Purpose,
            SubmittedAt = a.SubmittedAt,

            AssignedToUserId = a.AssignedToUserId,
            AssignedToUserName = a.AssignedToUser?.FullName,

            CreatedAt = a.CreatedAt

        }).ToList();
    }
}
