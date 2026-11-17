

namespace LMS.Application.DTO.Dashboard
{
    public class DashboardSummaryDto
    {
        public int TotalUsers { get; set; }

        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ApprovedApplications { get; set; }
        public int RejectedApplications { get; set; }


        public int TotalLoans { get; set; }
        public int ActiveLoans { get; set; }

        public decimal TotalOutstandingAmount { get; set; }



    }
}
