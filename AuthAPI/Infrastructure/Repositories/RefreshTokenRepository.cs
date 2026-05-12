using AuthAPI.Domain.Entities;
using AuthAPI.Domain.Interfaces;
using AuthAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly WriteDbContext _writeContext;
    private readonly ReadDbContext _readContext;

    public RefreshTokenRepository(WriteDbContext writeContext, ReadDbContext readContext)
    {
        _writeContext = writeContext;
        _readContext = readContext;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
        => await _readContext.RefreshTokens
            .AsNoTracking()
            .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(rt => rt.Token == token);

    public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
    {
        _writeContext.RefreshTokens.Add(refreshToken);
        await _writeContext.SaveChangesAsync();
        return refreshToken;
    }

    public async Task RevokeAsync(string token)
    {
        var refreshToken = await _writeContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token);
        if (refreshToken != null)
        {
            refreshToken.IsRevoked = true;
            await _writeContext.SaveChangesAsync();
        }
    }

    public async Task RevokeAllByUserAsync(int userId)
    {
        var tokens = await _writeContext.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();
        foreach (var token in tokens)
            token.IsRevoked = true;

        await _writeContext.SaveChangesAsync();
    }
}