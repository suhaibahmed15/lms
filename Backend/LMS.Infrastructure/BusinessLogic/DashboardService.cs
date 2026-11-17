
using LMS.Application.DTO.Dashboard;
using LMS.Application.Repositories.Interfaces;
using LMS.Application.Services.Interfaces;

namespace LMS.Infrastructure.BusinessLogic;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(int userId)
    {
        return await _dashboardRepository.GetSummaryAsync(userId);
    }
}
