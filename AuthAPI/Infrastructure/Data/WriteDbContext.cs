using AuthAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Infrastructure.Data;

public class WriteDbContext : DbContext
{
    public WriteDbContext(DbContextOptions<WriteDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Name).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();

            entity.HasOne(u => u.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(u => u.RoleId);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            entity.Property(rt => rt.Token).IsRequired();

            entity.HasOne(rt => rt.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(rt => rt.UserId);
        });

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Worker" },
            new Role { Id = 3, Name = "Customer" }
        );
    }
}