using AuthAPI.Domain.Entities;
using AuthAPI.Domain.Interfaces;
using AuthAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Infrastructure.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly ReadDbContext _readContext;

    public RoleRepository(ReadDbContext readContext)
    {
        _readContext = readContext;
    }

    public async Task<Role?> GetByNameAsync(string name)
        => await _readContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Name == name);

    public async Task<IEnumerable<Role>> GetAllAsync()
        => await _readContext.Roles
            .AsNoTracking()
            .ToListAsync();

    public async Task<Role?> GetByIdAsync(int id)
        => await _readContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
}