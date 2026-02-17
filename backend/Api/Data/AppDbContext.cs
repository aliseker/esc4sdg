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
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PartnerTranslation> PartnerTranslations => Set<PartnerTranslation>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseTranslation> CourseTranslations => Set<CourseTranslation>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<ModuleTranslation> ModuleTranslations => Set<ModuleTranslation>();
    public DbSet<ModuleItem> ModuleItems => Set<ModuleItem>();
    public DbSet<ModuleItemTranslation> ModuleItemTranslations => Set<ModuleItemTranslation>();
    public DbSet<UserCourseEnrollment> UserCourseEnrollments => Set<UserCourseEnrollment>();
    public DbSet<UserModuleItemProgress> UserModuleItemProgresses => Set<UserModuleItemProgress>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTranslation> ProjectTranslations => Set<ProjectTranslation>();
    public DbSet<ProjectGalleryImage> ProjectGalleryImages => Set<ProjectGalleryImage>();
    public DbSet<SiteTranslation> SiteTranslations => Set<SiteTranslation>();
    public DbSet<Rating> Ratings => Set<Rating>();

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

        builder.Entity<Language>()
            .HasIndex(l => l.Code)
            .IsUnique();

        builder.Entity<PartnerTranslation>()
            .HasKey(pt => new { pt.PartnerId, pt.LanguageId });

        builder.Entity<Course>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        builder.Entity<CourseTranslation>()
            .HasKey(ct => new { ct.CourseId, ct.LanguageId });

        builder.Entity<ModuleTranslation>()
            .HasKey(mt => new { mt.ModuleId, mt.LanguageId });

        builder.Entity<ModuleItemTranslation>()
            .HasKey(mt => new { mt.ModuleItemId, mt.LanguageId });

        builder.Entity<UserCourseEnrollment>()
            .HasKey(e => new { e.UserId, e.CourseId });

        builder.Entity<UserModuleItemProgress>()
            .HasKey(p => new { p.UserId, p.ModuleItemId });

        builder.Entity<Certificate>()
            .HasIndex(c => new { c.UserId, c.CourseId })
            .IsUnique();

        builder.Entity<Certificate>()
            .HasOne(c => c.Course)
            .WithMany()
            .HasForeignKey(c => c.CourseId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Cascade);

        builder.Entity<UserCourseEnrollment>()
            .HasOne(e => e.Course)
            .WithMany()
            .HasForeignKey(e => e.CourseId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Cascade);

        builder.Entity<UserModuleItemProgress>()
            .HasOne(p => p.ModuleItem)
            .WithMany()
            .HasForeignKey(p => p.ModuleItemId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Cascade);

        builder.Entity<Project>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        builder.Entity<ProjectTranslation>()
            .HasKey(pt => new { pt.ProjectId, pt.LanguageId });

        builder.Entity<SiteTranslation>()
            .HasKey(st => new { st.LanguageId, st.Key });

        builder.Entity<SiteTranslation>()
            .HasOne(st => st.Language)
            .WithMany()
            .HasForeignKey(st => st.LanguageId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Cascade);

        builder.Entity<ProjectGalleryImage>()
            .HasOne(g => g.Project)
            .WithMany(p => p.GalleryImages)
            .HasForeignKey(g => g.ProjectId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Cascade);

        builder.Entity<Rating>()
            .HasIndex(r => new { r.UserId, r.CourseId })
            .IsUnique();

        builder.Entity<Rating>()
            .HasOne(r => r.Course)
            .WithMany(c => c.Ratings)
            .HasForeignKey(r => r.CourseId)
            .OnDelete(Microsoft.EntityFrameworkCore.DeleteBehavior.Cascade);
    }
}
