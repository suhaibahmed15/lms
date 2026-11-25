using LMS.Application.DTO.LoanTypes;

namespace LMS.Application.Services.Interfaces;

public interface ILoanTypeService
{
    Task<List<LoanTypeResponseDto>> GetAllAsync();

    Task<List<LoanTypeResponseDto>> GetActiveAsync();

    Task<object> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? search,
        string? sortBy,
        string? sortDirection,
        bool? isActive);

    Task<LoanTypeResponseDto?> GetByIdAsync(int id);

    Task<LoanTypeResponseDto> CreateAsync(CreateLoanTypeDto dto, int? userId = null);

    Task<LoanTypeResponseDto?> UpdateAsync(int id, UpdateLoanTypeDto dto, int? userId = null);

    Task<bool> DeleteAsync(int id, int? userId = null);

    Task<bool?> ChangeStatusAsync(int id, bool isActive, int? userId = null);
}
