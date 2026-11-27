
using LMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Infrastructure.Data.Configurations;

public class AIPromptConfiguration : IEntityTypeConfiguration<AIPrompt>
{
    public void Configure(EntityTypeBuilder<AIPrompt> builder)
    {
        // Table name
        builder.ToTable("AIPrompts");

        // Primary key inherited from BaseEntity
        builder.HasKey(x => x.Id);

        // Prompt name
        builder.Property(x => x.PromptName)
            .IsRequired()
            .HasMaxLength(150);

        // Unique prompt key
        builder.Property(x => x.PromptKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(x => x.PromptKey)
            .IsUnique();

        // Actual AI prompt instructions
        builder.Property(x => x.PromptText)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        // Optional description
        builder.Property(x => x.Description)
            .HasMaxLength(500);

        // Active status
        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
    }
}
