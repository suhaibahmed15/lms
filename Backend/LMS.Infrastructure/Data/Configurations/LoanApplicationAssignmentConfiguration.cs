
using LMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Infrastructure.Data.Configurations;

public class LoanApplicationAssignmentConfiguration
    : IEntityTypeConfiguration<LoanApplicationAssignment>
{
    public void Configure(EntityTypeBuilder<LoanApplicationAssignment> builder)
    {
        builder.ToTable("LoanApplicationAssignments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AssignedAt)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false);

        // Loan Application relationship
        builder.HasOne(x => x.LoanApplication)
            .WithMany(x => x.Assignments)
            .HasForeignKey(x => x.LoanApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Assigned To User relationship
        builder.HasOne(x => x.AssignedToUser)
            .WithMany(x => x.ReceivedLoanAssignments)
            .HasForeignKey(x => x.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Assigned By User relationship
        builder.HasOne(x => x.AssignedByUser)
            .WithMany(x => x.CreatedLoanAssignments)
            .HasForeignKey(x => x.AssignedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Application assignment history index
        builder.HasIndex(x => x.LoanApplicationId);
    }
}
