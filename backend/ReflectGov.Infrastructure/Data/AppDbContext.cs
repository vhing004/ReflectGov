using Microsoft.EntityFrameworkCore;
using ReflectGov.Domain.Entities;

namespace ReflectGov.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<FeedbackAttachment> FeedbackAttachments => Set<FeedbackAttachment>();
    public DbSet<FeedbackLog> FeedbackLogs => Set<FeedbackLog>();
    public DbSet<FeedbackRating> FeedbackRatings => Set<FeedbackRating>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Username).HasMaxLength(100).IsRequired();
            e.Property(u => u.FullName).HasMaxLength(200).IsRequired();
            e.Property(u => u.Email).HasMaxLength(200);

            e.HasOne(u => u.Department)
             .WithMany(d => d.Users)
             .HasForeignKey(u => u.DepartmentId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Department
        modelBuilder.Entity<Department>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.Name).HasMaxLength(200).IsRequired();
        });

        // Category
        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).HasMaxLength(200).IsRequired();
        });

        // Feedback
        modelBuilder.Entity<Feedback>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasIndex(f => f.TrackingCode).IsUnique();
            e.Property(f => f.TrackingCode).HasMaxLength(50).IsRequired();
            e.Property(f => f.Title).HasMaxLength(500).IsRequired();

            e.HasOne(f => f.Category)
             .WithMany(c => c.Feedbacks)
             .HasForeignKey(f => f.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.Citizen)
             .WithMany(u => u.CitizenFeedbacks)
             .HasForeignKey(f => f.CitizenId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(f => f.AssignedDepartment)
             .WithMany(d => d.AssignedFeedbacks)
             .HasForeignKey(f => f.AssignedDepartmentId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(f => f.AssignedUser)
             .WithMany(u => u.AssignedFeedbacks)
             .HasForeignKey(f => f.AssignedUserId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // FeedbackAttachment
        modelBuilder.Entity<FeedbackAttachment>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasOne(a => a.Feedback)
             .WithMany(f => f.Attachments)
             .HasForeignKey(a => a.FeedbackId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // FeedbackLog
        modelBuilder.Entity<FeedbackLog>(e =>
        {
            e.HasKey(l => l.Id);
            e.HasOne(l => l.Feedback)
             .WithMany(f => f.Logs)
             .HasForeignKey(l => l.FeedbackId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // FeedbackRating - 1-1 với Feedback
        modelBuilder.Entity<FeedbackRating>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Feedback)
             .WithOne(f => f.Rating)
             .HasForeignKey<FeedbackRating>(r => r.FeedbackId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
