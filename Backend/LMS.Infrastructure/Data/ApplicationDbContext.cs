using LMS.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Security.Claims;
using System.Text.Json;

namespace LMS.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IHttpContextAccessor? httpContextAccessor = null)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<LoanType> LoanTypes => Set<LoanType>();
    public DbSet<LoanApplication> LoanApplications => Set<LoanApplication>();
    public DbSet<LoanDocument> LoanDocuments => Set<LoanDocument>();
    public DbSet<LoanGuarantor> LoanGuarantors => Set<LoanGuarantor>();
    public DbSet<LoanApproval> LoanApprovals => Set<LoanApproval>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<RepaymentSchedule> RepaymentSchedules => Set<RepaymentSchedule>();
    public DbSet<Repayment> Repayments => Set<Repayment>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<RoleMenu> RoleMenus => Set<RoleMenu>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    public DbSet<UserMenu> UserMenus => Set<UserMenu>();

    public DbSet<LoanApplicationAssignment> LoanApplicationAssignments
    => Set<LoanApplicationAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    private bool _isAuditing = false;

    public override int SaveChanges()
    {
        return SaveChanges(true);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyAuditTimestamps();

        if (_isAuditing)
        {
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        try
        {
            _isAuditing = true;
            var auditEntries = OnBeforeSaveChanges();
            var result = base.SaveChanges(acceptAllChangesOnSuccess);

            if (auditEntries.Count > 0)
            {
                OnAfterSaveChanges(auditEntries);
                base.SaveChanges(acceptAllChangesOnSuccess);
            }

            return result;
        }
        finally
        {
            _isAuditing = false;
        }
    }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return SaveChangesAsync(true, cancellationToken);
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ApplyAuditTimestamps();

        if (_isAuditing)
        {
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        try
        {
            _isAuditing = true;
            var auditEntries = OnBeforeSaveChanges();
            var result = await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);

            if (auditEntries.Count > 0)
            {
                await OnAfterSaveChangesAsync(auditEntries, cancellationToken);
                await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
            }

            return result;
        }
        finally
        {
            _isAuditing = false;
        }
    }

    private List<AuditEntry> OnBeforeSaveChanges()
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();
        var currentUserId = GetCurrentUserId();
        var ip = GetClientIpAddress();

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var entityName = entry.Metadata.ClrType.Name;
            var auditEntry = new AuditEntry(entry)
            {
                EntityName = entityName,
                UserId = currentUserId,
                IpAddress = ip
            };

            switch (entry.State)
            {
                case EntityState.Added:
                    auditEntry.Action = "CREATE";
                    foreach (var prop in entry.Properties)
                    {
                        if (prop.Metadata.IsPrimaryKey()) continue;
                        var propName = prop.Metadata.Name;
                        if (propName is "CreatedAt" or "UpdatedAt" or "CreatedBy" or "UpdatedBy" or "IsDeleted") continue;

                        if (propName.Contains("Password", StringComparison.OrdinalIgnoreCase))
                        {
                            auditEntry.Changes[propName] = "[PROTECTED]";
                        }
                        else if (prop.CurrentValue != null)
                        {
                            auditEntry.Changes[propName] = prop.CurrentValue.ToString();
                        }
                    }
                    auditEntries.Add(auditEntry);
                    break;

                case EntityState.Modified:
                    var isDeletedProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsDeleted");
                    if (isDeletedProp != null && isDeletedProp.IsModified && Equals(isDeletedProp.CurrentValue, true) && !Equals(isDeletedProp.OriginalValue, true))
                    {
                        auditEntry.Action = "DELETE";
                    }
                    else
                    {
                        auditEntry.Action = "UPDATE";
                    }

                    if (entry.Entity is BaseEntity be)
                    {
                        auditEntry.EntityId = be.Id;
                    }

                    foreach (var prop in entry.Properties)
                    {
                        if (prop.IsModified && !Equals(prop.OriginalValue, prop.CurrentValue))
                        {
                            var propName = prop.Metadata.Name;
                            if (propName is "UpdatedAt" or "UpdatedBy") continue;

                            if (propName.Contains("Password", StringComparison.OrdinalIgnoreCase))
                            {
                                auditEntry.Changes[propName] = new { Old = "[PROTECTED]", New = "[PROTECTED]" };
                            }
                            else
                            {
                                auditEntry.Changes[propName] = new
                                {
                                    Old = prop.OriginalValue?.ToString(),
                                    New = prop.CurrentValue?.ToString()
                                };
                            }
                        }
                    }

                    if (auditEntry.Changes.Count > 0 || auditEntry.Action == "DELETE")
                    {
                        auditEntries.Add(auditEntry);
                    }
                    break;

                case EntityState.Deleted:
                    auditEntry.Action = "HARD_DELETE";
                    if (entry.Entity is BaseEntity baseEnt)
                    {
                        auditEntry.EntityId = baseEnt.Id;
                    }
                    auditEntries.Add(auditEntry);
                    break;
            }
        }

        return auditEntries;
    }

    private void OnAfterSaveChanges(List<AuditEntry> auditEntries)
    {
        var logs = new List<AuditLog>();
        foreach (var auditEntry in auditEntries)
        {
            if (auditEntry.EntityId == null && auditEntry.Entry.Entity is BaseEntity be && be.Id > 0)
            {
                auditEntry.EntityId = be.Id;
            }

            logs.Add(auditEntry.ToAuditLog());
        }

        if (logs.Count > 0)
        {
            AuditLogs.AddRange(logs);
        }
    }

    private async Task OnAfterSaveChangesAsync(List<AuditEntry> auditEntries, CancellationToken cancellationToken)
    {
        var logs = new List<AuditLog>();
        foreach (var auditEntry in auditEntries)
        {
            if (auditEntry.EntityId == null && auditEntry.Entry.Entity is BaseEntity be && be.Id > 0)
            {
                auditEntry.EntityId = be.Id;
            }

            logs.Add(auditEntry.ToAuditLog());
        }

        if (logs.Count > 0)
        {
            await AuditLogs.AddRangeAsync(logs, cancellationToken);
        }
    }

    private string? GetClientIpAddress()
    {
        try
        {
            var httpContext = _httpContextAccessor?.HttpContext;
            if (httpContext == null) return null;

            var forwarded = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwarded))
            {
                return forwarded.Split(',')[0].Trim();
            }

            return httpContext.Connection.RemoteIpAddress?.ToString();
        }
        catch
        {
            return null;
        }
    }

    private sealed class AuditEntry
    {
        public EntityEntry Entry { get; }
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public int? UserId { get; set; }
        public string? IpAddress { get; set; }
        public Dictionary<string, object?> Changes { get; } = new();

        public AuditEntry(EntityEntry entry)
        {
            Entry = entry;
        }

        public AuditLog ToAuditLog()
        {
            var details = Changes.Count > 0
                ? JsonSerializer.Serialize(Changes)
                : null;

            if (details != null && details.Length > 2000)
            {
                details = details[..1997] + "...";
            }

            return new AuditLog
            {
                UserId = UserId,
                Action = Action,
                EntityName = EntityName,
                EntityId = EntityId ?? (Entry.Entity is BaseEntity be && be.Id > 0 ? be.Id : null),
                Details = details,
                IpAddress = IpAddress,
                OccurredAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
        }
    }

    private int? GetCurrentUserId()
    {
        var user = _httpContextAccessor?.HttpContext?.User;

        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var userIdValue = user.FindFirst("UserId")?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (int.TryParse(userIdValue, out var userId) && userId > 0)
        {
            return userId;
        }

        return null;
    }

    private void ApplyAuditTimestamps()
    {
        var utcNow = DateTime.UtcNow;
        var currentUserId = GetCurrentUserId();

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.IsDeleted = false;
                entry.Entity.UpdatedAt = null;
                entry.Entity.UpdatedBy = null;

                if (currentUserId.HasValue)
                {
                    entry.Entity.CreatedBy = currentUserId.Value;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Property(e => e.CreatedAt).IsModified = false;
                entry.Property(e => e.CreatedBy).IsModified = false;

                entry.Entity.UpdatedAt = utcNow;

                if (currentUserId.HasValue)
                {
                    entry.Entity.UpdatedBy = currentUserId.Value;
                }
            }
        }
    }
}

