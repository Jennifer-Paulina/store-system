using AuthAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AuthAPI.Application.Tasks;

public class RefreshTokenCleanupTask : BackgroundService
{
    private readonly ILogger<RefreshTokenCleanupTask> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1);

    public RefreshTokenCleanupTask(
        ILogger<RefreshTokenCleanupTask> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Servicio de limpieza de refresh tokens iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_interval, stoppingToken);
            await CleanExpiredTokensAsync();
        }
    }

    private async Task CleanExpiredTokensAsync()
    {
        _logger.LogInformation("Iniciando limpieza de refresh tokens expirados...");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var readContext = scope.ServiceProvider.GetRequiredService<ReadDbContext>();
            var writeContext = scope.ServiceProvider.GetRequiredService<WriteDbContext>();

            // Verificar que la réplica esté disponible
            var canRead = await readContext.Database.CanConnectAsync();
            if (!canRead)
            {
                _logger.LogWarning("Réplica no disponible. Omitiendo limpieza de refresh tokens.");
                return;
            }

            var expiredTokens = await readContext.RefreshTokens
                .Where(rt => rt.ExpiresAt < DateTime.UtcNow || rt.IsRevoked)
                .ToListAsync();

            if (expiredTokens.Count == 0)
            {
                _logger.LogInformation("No se encontraron refresh tokens expirados.");
                return;
            }

            // Identificar datos vulnerables — tokens con fechas inválidas
            var validTokens = expiredTokens
                .Where(rt => rt.ExpiresAt != default && rt.UserId > 0)
                .ToList();

            var invalidTokens = expiredTokens.Except(validTokens).ToList();
            if (invalidTokens.Count > 0)
            {
                _logger.LogWarning(
                    "Se encontraron {Count} tokens con datos inválidos, omitiendo.",
                    invalidTokens.Count);
            }

            foreach (var token in validTokens)
            {
                writeContext.RefreshTokens.Remove(token);
            }

            await writeContext.SaveChangesAsync();

            _logger.LogInformation(
                "Limpieza completada. Tokens eliminados: {Count}",
                validTokens.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en limpieza de refresh tokens.");
        }
    }
}