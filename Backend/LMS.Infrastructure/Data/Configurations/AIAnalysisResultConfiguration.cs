
using LMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Infrastructure.Data.Configurations;

public class AIAnalysisResultConfiguration
    : IEntityTypeConfiguration<AIAnalysisResult>
{
    public void Configure(EntityTypeBuilder<AIAnalysisResult> builder)
    {
        builder.ToTable("AIAnalysisResults");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Analysis)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Summary)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.RiskLevel)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Recommendations)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.GeneratedAt)
            .IsRequired();

        builder.HasOne(x => x.LoanApplication)
            .WithMany()
            .HasForeignKey(x => x.LoanApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.LoanApplicationId);
    }
}
