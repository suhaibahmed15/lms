using LMS.Application.DTO.LoanTypes;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;
using LMS.Domain.Entities;

namespace LMS.Infrastructure.BusinessLogic;

public class LoanTypeService : ILoanTypeService
{
    private readonly ILoanTypeRepository _loanTypeRepository;

    public LoanTypeService(ILoanTypeRepository loanTypeRepository)
    {
        _loanTypeRepository = loanTypeRepository;
    }

    public async Task<List<LoanTypeResponseDto>> GetAllAsync()
    {
        var items = await _loanTypeRepository.GetAllAsync();
        return items.Select(MapToResponse).ToList();
    }

    public async Task<List<LoanTypeResponseDto>> GetActiveAsync()
    {
        var items = await _loanTypeRepository.GetActiveAsync();
        return items.Select(MapToResponse).ToList();
    }

    public async Task<object> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive)
    {
        pageNumber = pageNumber > 0 ? pageNumber : 1;
        pageSize = pageSize > 0 ? Math.Min(pageSize, 100) : 10;

        var (items, totalRecords, activeCount, inactiveCount) = await _loanTypeRepository.GetPagedAsync(
            pageNumber, pageSize, search, sortBy, sortDirection, isActive);

        var totalPages = totalRecords == 0 ? 0 : (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new
        {
            message = "Loan types retrieved successfully.",
            data = items.Select(MapToResponse).ToList(),
            totalRecords,
            pageNumber,
            pageSize,
            totalPages,
            activeCount,
            inactiveCount
        };
    }

    public async Task<LoanTypeResponseDto?> GetByIdAsync(int id)
    {
        var item = await _loanTypeRepository.GetByIdAsync(id);
        return item == null ? null : MapToResponse(item);
    }

    public async Task<LoanTypeResponseDto> CreateAsync(CreateLoanTypeDto dto, int? userId = null)
    {
        if (dto.MinAmount > dto.MaxAmount)
        {
            throw new ArgumentException("Minimum amount cannot be greater than maximum amount.");
        }

        if (dto.MinTermMonths > dto.MaxTermMonths)
        {
            throw new ArgumentException("Minimum term cannot be greater than maximum term.");
        }

        var normalizedName = dto.Name.Trim();
        var normalizedCode = dto.Code.Trim().ToUpperInvariant();

        if (await _loanTypeRepository.ExistsByNameAsync(normalizedName))
        {
            throw new InvalidOperationException($"A loan type with name '{normalizedName}' already exists.");
        }

        if (await _loanTypeRepository.ExistsByCodeAsync(normalizedCode))
        {
            throw new InvalidOperationException($"A loan type with code '{normalizedCode}' already exists.");
        }

        var loanType = new LoanType
        {
            Name = normalizedName,
            Code = normalizedCode,
            Description = dto.Description?.Trim(),
            MinAmount = dto.MinAmount,
            MaxAmount = dto.MaxAmount,
            InterestRate = dto.InterestRate,
            MinTermMonths = dto.MinTermMonths,
            MaxTermMonths = dto.MaxTermMonths,
            RequiresGuarantor = dto.RequiresGuarantor,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            IsDeleted = false
        };

        await _loanTypeRepository.AddAsync(loanType);
        await _loanTypeRepository.SaveChangesAsync();

        return MapToResponse(loanType);
    }

    public async Task<LoanTypeResponseDto?> UpdateAsync(int id, UpdateLoanTypeDto dto, int? userId = null)
    {
        var loanType = await _loanTypeRepository.GetByIdAsync(id);
        if (loanType == null)
        {
            return null;
        }

        if (dto.MinAmount > dto.MaxAmount)
        {
            throw new ArgumentException("Minimum amount cannot be greater than maximum amount.");
        }

        if (dto.MinTermMonths > dto.MaxTermMonths)
        {
            throw new ArgumentException("Minimum term cannot be greater than maximum term.");
        }

        var normalizedName = dto.Name.Trim();
        var normalizedCode = dto.Code.Trim().ToUpperInvariant();

        if (await _loanTypeRepository.ExistsByNameAsync(normalizedName, id))
        {
            throw new InvalidOperationException($"A loan type with name '{normalizedName}' already exists.");
        }

        if (await _loanTypeRepository.ExistsByCodeAsync(normalizedCode, id))
        {
            throw new InvalidOperationException($"A loan type with code '{normalizedCode}' already exists.");
        }

        loanType.Name = normalizedName;
        loanType.Code = normalizedCode;
        loanType.Description = dto.Description?.Trim();
        loanType.MinAmount = dto.MinAmount;
        loanType.MaxAmount = dto.MaxAmount;
        loanType.InterestRate = dto.InterestRate;
        loanType.MinTermMonths = dto.MinTermMonths;
        loanType.MaxTermMonths = dto.MaxTermMonths;
        loanType.RequiresGuarantor = dto.RequiresGuarantor;
        loanType.IsActive = dto.IsActive;
        loanType.UpdatedAt = DateTime.UtcNow;
        loanType.UpdatedBy = userId;

        await _loanTypeRepository.UpdateAsync(loanType);
        await _loanTypeRepository.SaveChangesAsync();

        return MapToResponse(loanType);
    }

    public async Task<bool> DeleteAsync(int id, int? userId = null)
    {
        var loanType = await _loanTypeRepository.GetByIdAsync(id);
        if (loanType == null)
        {
            return false;
        }

        if (await _loanTypeRepository.HasApplicationsAsync(id))
        {
            throw new InvalidOperationException(
                "Cannot delete this loan type because active or historical loan applications are linked to it.");
        }

        loanType.IsDeleted = true;
        loanType.IsActive = false;
        loanType.UpdatedAt = DateTime.UtcNow;
        loanType.UpdatedBy = userId;

        await _loanTypeRepository.UpdateAsync(loanType);
        await _loanTypeRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool?> ChangeStatusAsync(int id, bool isActive, int? userId = null)
    {
        var loanType = await _loanTypeRepository.GetByIdAsync(id);
        if (loanType == null)
        {
            return null;
        }

        loanType.IsActive = isActive;
        loanType.UpdatedAt = DateTime.UtcNow;
        loanType.UpdatedBy = userId;

        await _loanTypeRepository.UpdateAsync(loanType);
        await _loanTypeRepository.SaveChangesAsync();

        return true;
    }

    private static LoanTypeResponseDto MapToResponse(LoanType x)
    {
        return new LoanTypeResponseDto
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            Description = x.Description,
            MinAmount = x.MinAmount,
            MaxAmount = x.MaxAmount,
            InterestRate = x.InterestRate,
            MinTermMonths = x.MinTermMonths,
            MaxTermMonths = x.MaxTermMonths,
            RequiresGuarantor = x.RequiresGuarantor,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };
    }
}
