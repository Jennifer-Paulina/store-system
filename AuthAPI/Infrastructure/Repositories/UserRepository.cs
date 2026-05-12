using AuthAPI.Domain.Entities;
using AuthAPI.Domain.Interfaces;
using AuthAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly WriteDbContext _writeContext;
    private readonly ReadDbContext _readContext;

    public UserRepository(WriteDbContext writeContext, ReadDbContext readContext)
    {
        _writeContext = writeContext;
        _readContext = readContext;
    }

    public async Task<User?> GetByIdAsync(int id)
        => await _readContext.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User?> GetByEmailAsync(string email)
        => await _readContext.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

    public async Task<IEnumerable<User>> GetAllAsync()
        => await _readContext.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .ToListAsync();

    public async Task<bool> ExistsAsync(string email)
        => await _readContext.Users
            .AsNoTracking()
            .AnyAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        _writeContext.Users.Add(user);
        await _writeContext.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        _writeContext.Users.Update(user);
        await _writeContext.SaveChangesAsync();
        return user;
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _writeContext.Users.FindAsync(id);
        if (user != null)
        {
            _writeContext.Users.Remove(user);
            await _writeContext.SaveChangesAsync();
        }
    }
}