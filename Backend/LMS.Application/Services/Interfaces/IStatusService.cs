using LMS.Application.DTO.Statuses;

namespace LMS.Application.Services.Interfaces
{
    public interface IStatusService
    {

        Task<List<StatusResponseDto>> GetAllAsync();

        Task<StatusResponseDto?> GetByIdAsync(int id);

        Task<StatusResponseDto> CreateAsync(CreateStatusDto dto);

        Task<StatusResponseDto?> UpdateAsync(

            int id,
            UpdateStatusDto dto
            );

        Task<bool?> ChangeStatusAsync(int id, bool IsActive);

        Task<bool> DeleteAsync(int id);
    }
}
