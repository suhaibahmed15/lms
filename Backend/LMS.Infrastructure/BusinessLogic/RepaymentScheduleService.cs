using LMS.Application.DTO.Repayments;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class RepaymentScheduleService : IRepaymentScheduleService
{
    private readonly IRepaymentScheduleRepository _repository;

    public RepaymentScheduleService(
        IRepaymentScheduleRepository repository)
    {
        _repository = repository;
    }

    public async Task<int> GenerateAsync(
        int loanId,
        int userId,
        GenerateRepaymentScheduleDto dto)
    {
        var loan = await _repository.GetLoanByIdAsync(loanId);

        if (loan == null)
            throw new KeyNotFoundException("Loan not found.");

        if (loan.StatusId != 16)
            throw new InvalidOperationException(
                "Repayment schedule can only be generated for an active loan.");

        if (loan.TermMonths <= 0 ||
            loan.PrincipalAmount <= 0 ||
            loan.TotalPayableAmount <= 0)
        {
            throw new InvalidOperationException(
                "Loan details are invalid.");
        }

        if (dto.FirstDueDate.Date <= DateTime.UtcNow.Date)
        {
            throw new ArgumentException(
                "First due date must be a future date.");
        }

        var scheduleExists =
            await _repository.ScheduleExistsAsync(loanId);

        if (scheduleExists)
            throw new InvalidOperationException(
                "Repayment schedule already exists for this loan.");

        var pendingStatus =
            await _repository.GetStatusByKeyAsync(
                "REPAYMENT_PENDING",
                "Repayment");

        if (pendingStatus == null)
            throw new KeyNotFoundException(
                "Pending repayment status not found.");

        var totalInterest =
            loan.TotalPayableAmount - loan.PrincipalAmount;

        var monthlyPrincipal = decimal.Round(
            loan.PrincipalAmount / loan.TermMonths,
            2,
            MidpointRounding.AwayFromZero);

        var monthlyInterest = decimal.Round(
            totalInterest / loan.TermMonths,
            2,
            MidpointRounding.AwayFromZero);

        decimal remainingPrincipal = loan.PrincipalAmount;
        decimal remainingInterest = totalInterest;

        var schedules = new List<RepaymentSchedule>();

        for (int i = 1; i <= loan.TermMonths; i++)
        {
            var principalDue = i == loan.TermMonths
                ? remainingPrincipal
                : monthlyPrincipal;

            var interestDue = i == loan.TermMonths
                ? remainingInterest
                : monthlyInterest;

            principalDue = decimal.Round(principalDue, 2);
            interestDue = decimal.Round(interestDue, 2);

            schedules.Add(new RepaymentSchedule
            {
                LoanId = loan.Id,
                InstallmentNumber = i,
                DueDate = dto.FirstDueDate.Date.AddMonths(i - 1),
                PrincipalDue = principalDue,
                InterestDue = interestDue,
                TotalDue = principalDue + interestDue,
                PaidAmount = 0,
                StatusId = pendingStatus.Id,
                PaidAt = null,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                IsDeleted = false
            });

            remainingPrincipal -= principalDue;
            remainingInterest -= interestDue;
        }

        return await _repository.CreateSchedulesAsync(schedules);
    }
}