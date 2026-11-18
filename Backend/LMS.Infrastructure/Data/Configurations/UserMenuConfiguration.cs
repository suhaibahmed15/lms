
using LMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LMS.Infrastructure.Data.Configurations;

public class UserMenuConfiguration : IEntityTypeConfiguration<UserMenu>
{
    public void Configure(EntityTypeBuilder<UserMenu> builder)
    {
        builder.HasKey(um => um.Id);

        // User relationship
        builder.HasOne(um => um.User)
            .WithMany(u => u.UserMenus)
            .HasForeignKey(um => um.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Menu relationship
        builder.HasOne(um => um.Menu)
            .WithMany(m => m.UserMenus)
            .HasForeignKey(um => um.MenuId)
            .OnDelete(DeleteBehavior.Restrict);

        // Prevent duplicate menu assignment to the same user
        builder.HasIndex(um => new { um.UserId, um.MenuId })
            .IsUnique();

        builder.HasQueryFilter(um => !um.IsDeleted);
    }
}
