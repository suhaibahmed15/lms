
using LMS.Application.DTO.Dashboard;

namespace LMS.Application.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(int userId);
}
