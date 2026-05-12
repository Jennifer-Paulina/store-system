using AuthAPI.Application.Services;
using AuthAPI.Domain.DTOs;
using AuthAPI.Domain.Entities;
using AuthAPI.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AuthAPI.Application.Logic;

public class AuthLogic
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthLogic(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IRoleRepository roleRepository,
        JwtService jwtService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _roleRepository = roleRepository;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // Verificar si el email ya existe
        if (await _userRepository.ExistsAsync(request.Email))
            throw new Exception("El email ya está registrado.");

        // Obtener rol Customer por defecto
        var role = await _roleRepository.GetByNameAsync("Customer")
            ?? throw new Exception("Rol no encontrado.");

        // Crear usuario
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = role.Id,
            Role = role
        };

        await _userRepository.CreateAsync(user);

        // Generar tokens
        return await GenerateTokensAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        // Buscar usuario
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new Exception("Credenciales inválidas.");

        // Verificar contraseña
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new Exception("Credenciales inválidas.");

        // Verificar que esté activo
        if (!user.IsActive)
            throw new Exception("Usuario inactivo.");

        // Revocar tokens anteriores
        await _refreshTokenRepository.RevokeAllByUserAsync(user.Id);

        // Generar tokens nuevos
        return await GenerateTokensAsync(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        // Validar que el access token sea legítimo (aunque esté expirado)
        var validationResult = _jwtService.ValidateAccessToken(request.AccessToken);
        if (validationResult == null)
            throw new Exception("Access token inválido.");

        // Buscar el refresh token
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken)
            ?? throw new Exception("Refresh token inválido.");

        // Validar que no esté revocado ni expirado
        if (refreshToken.IsRevoked)
            throw new Exception("Refresh token revocado.");

        if (refreshToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Refresh token expirado.");

        var user = refreshToken.User;

        // Revocar token actual
        await _refreshTokenRepository.RevokeAsync(request.RefreshToken);

        // Generar nuevos tokens
        return await GenerateTokensAsync(user);
    }

    // Método privado reutilizable
    private async Task<AuthResponseDto> GenerateTokensAsync(User user)
    {
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshTokenValue = _jwtService.GenerateRefreshToken();
        var expirationDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"]!);

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays)
        };

        await _refreshTokenRepository.CreateAsync(refreshToken);

        return new AuthResponseDto
        {
            Id = user.Id,
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.Name
        };
    }
}