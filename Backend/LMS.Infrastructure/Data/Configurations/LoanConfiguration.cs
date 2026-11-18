
using LMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Infrastructure.Data.Configurations;

public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.ToTable("Loans");

        builder.HasKey(x => x.Id);

        // Loan Number
        builder.Property(x => x.LoanNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Financial Properties
        builder.Property(x => x.PrincipalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.InterestRate)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(x => x.TotalPayableAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.OutstandingBalance)
            .HasPrecision(18, 2)
            .IsRequired();

        // Loan Application (One-to-One)
        builder.HasOne(x => x.LoanApplication)
            .WithOne(x => x.Loan)
            .HasForeignKey<Loan>(x => x.LoanApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Borrower User
        builder.HasOne(x => x.BorrowerUser)
            .WithMany(x => x.BorrowerLoans)
            .HasForeignKey(x => x.BorrowerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Disbursed By User (Optional)
        builder.HasOne(x => x.DisbursedByUser)
            .WithMany(x => x.DisbursedLoans)
            .HasForeignKey(x => x.DisbursedByUserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Loan Status
        builder.HasOne(x => x.Status)
            .WithMany(x => x.Loans)
            .HasForeignKey(x => x.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Repayment Schedules (One-to-Many)
        builder.HasMany(x => x.RepaymentSchedules)
            .WithOne(x => x.Loan)
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.Restrict);

        // Repayments (One-to-Many)
        builder.HasMany(x => x.Repayments)
            .WithOne(x => x.Loan)
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.Restrict);

        // Base Entity Properties
        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false);

        // Soft Delete Filter
        builder.HasQueryFilter(x => !x.IsDeleted);

        // Unique Loan Number
        builder.HasIndex(x => x.LoanNumber)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        // One Loan Per Loan Application
        builder.HasIndex(x => x.LoanApplicationId)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
    }
}
