
using LMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Infrastructure.Data.Configurations;

public class LoanApplicationConfiguration : IEntityTypeConfiguration<LoanApplication>
{
    public void Configure(EntityTypeBuilder<LoanApplication> builder)
    {
        builder.ToTable("LoanApplications");

        builder.HasKey(x => x.Id);

        // Application Number
        builder.Property(x => x.ApplicationNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Requested Amount
        builder.Property(x => x.RequestedAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        // Purpose
        builder.Property(x => x.Purpose)
            .HasMaxLength(1000);

        // Review Remarks
        builder.Property(x => x.ReviewRemarks)
            .HasMaxLength(1000);

        // Base Entity Properties
        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false);

        // Unique Application Number
        builder.HasIndex(x => x.ApplicationNumber)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        // Applicant User Relationship
        builder.HasOne(x => x.ApplicantUser)
            .WithMany(u => u.LoanApplications)
            .HasForeignKey(x => x.ApplicantUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Reviewer User Relationship
        builder.HasOne(x => x.ReviewedByUser)
            .WithMany(u => u.ReviewedLoanApplications)
            .HasForeignKey(x => x.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Assigned Loan Officer Relationship
        builder.HasOne(x => x.AssignedToUser)
            .WithMany(u => u.AssignedLoanApplications)
            .HasForeignKey(x => x.AssignedToUserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Loan Type Relationship
        builder.HasOne(x => x.LoanType)
            .WithMany(lt => lt.LoanApplications)
            .HasForeignKey(x => x.LoanTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Status Relationship
        builder.HasOne(x => x.Status)
            .WithMany(s => s.LoanApplications)
            .HasForeignKey(x => x.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft Delete Filter
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
