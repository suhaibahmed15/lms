namespace LMS.Application.DTO.Dashboard;

public class DashboardSummaryDto
{
    public string RoleKey { get; set; } = string.Empty;

    // User counts
    public int TotalUsers { get; set; }
    public int TotalCustomers { get; set; }

    // Application stats
    public int TotalApplications { get; set; }
    public int PendingApplications { get; set; }
    public int ApprovedApplications { get; set; }
    public int RejectedApplications { get; set; }
    public int ApplicationsAwaitingApproval { get; set; }
    public int ApplicationsUnderReview { get; set; }
    public int ApplicationsAwaitingDocuments { get; set; }
    public int ReviewedApplications { get; set; }

    // Loan stats
    public int TotalLoans { get; set; }
    public int ActiveLoans { get; set; }
    public int ClosedLoans { get; set; }
    public decimal TotalDisbursedAmount { get; set; }
    public decimal TotalOutstandingAmount { get; set; }

    // Repayment stats
    public int TotalRepayments { get; set; }
    public int PendingRepayments { get; set; }
    public decimal TotalCollectedRepayments { get; set; }

    // Customer specific stats
    public int UpcomingInstallments { get; set; }
    public int PaidInstallments { get; set; }

    // Officer workload list (for Manager & Admin)
    public List<OfficerWorkloadDto> OfficerWorkload { get; set; } = new();
}

public class OfficerWorkloadDto
{
    public int OfficerId { get; set; }
    public string OfficerName { get; set; } = string.Empty;
    public int AssignedApplications { get; set; }
    public int ReviewedApplications { get; set; }
}
