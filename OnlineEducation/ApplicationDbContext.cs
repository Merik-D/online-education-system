using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Models;
using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}