
using LMS.Application.DTO.Dashboard;

namespace LMS.Application.Repositories.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardSummaryDto> GetSummaryAsync(int userId);
}

