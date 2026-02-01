namespace backend.Api.Data;

using backend.Api.Entities;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Admin> Admins => Set<Admin>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>()
            .HasIndex(u => u.NormalizedEmail)
            .IsUnique();

        builder.Entity<User>()
            .HasIndex(u => u.NormalizedUsername)
            .IsUnique();

        builder.Entity<Role>().HasData(
            new Role { Id = 1, Name = RoleNames.Admin },
            new Role { Id = 2, Name = RoleNames.User });

        builder.Entity<Admin>()
            .HasIndex(a => a.NormalizedUsername)
            .IsUnique();

        builder.Entity<Admin>()
            .HasIndex(a => a.NormalizedEmail)
            .IsUnique();
    }
}
