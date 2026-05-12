using System.Net;
using System.Net.Http.Json;
using AuthAPI.Domain.DTOs;
using AuthAPI.Tests.Config;

namespace AuthAPI.Tests.Controllers;

public class AuthControllerTest : IClassFixture<AuthApiWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTest(AuthApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ─── REGISTER ────────────────────────────────────────────────

    [Fact]
    public async Task Register_Ok_DatosValidos()
    {
        var response = await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = $"test_{Guid.NewGuid()}@gmail.com",
            Password = "123456"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(result);
        Assert.NotEmpty(result.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
    }

    [Fact]
    public async Task Register_BadRequest_EmailDuplicado()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });

        var response = await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("El email ya está registrado.", result!.Message);
    }

    // ─── LOGIN ────────────────────────────────────────────────────

    [Fact]
    public async Task Login_Ok_CredencialesValidas()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });

        var response = await _client.PostAsJsonAsync("/auth/login", new LoginRequestDto
        {
            Email = email,
            Password = "123456"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(result);
        Assert.NotEmpty(result.AccessToken);
    }

    [Fact]
    public async Task Login_BadRequest_ContrasenaIncorrecta()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });

        var response = await _client.PostAsJsonAsync("/auth/login", new LoginRequestDto
        {
            Email = email,
            Password = "incorrecta"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Credenciales inválidas.", result!.Message);
    }

    [Fact]
    public async Task Login_BadRequest_UsuarioNoExiste()
    {
        var response = await _client.PostAsJsonAsync("/auth/login", new LoginRequestDto
        {
            Email = "noexiste@gmail.com",
            Password = "123456"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Credenciales inválidas.", result!.Message);
    }

    // ─── REFRESH TOKEN ────────────────────────────────────────────
    [Fact]
    public async Task RefreshToken_Ok_TokenValido()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        var registerResponse = await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });
        var authResult = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        var response = await _client.PostAsJsonAsync("/auth/refresh-token", new RefreshTokenRequestDto
        {
            AccessToken = authResult!.AccessToken,
            RefreshToken = authResult.RefreshToken
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(result);
        Assert.NotEmpty(result.AccessToken);
    }
    
    [Fact]
    public async Task RefreshToken_BadRequest_TokenRevocado()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        var registerResponse = await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });
        var authResult = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        await _client.PostAsJsonAsync("/auth/login", new LoginRequestDto
        {
            Email = email,
            Password = "123456"
        });

        var response = await _client.PostAsJsonAsync("/auth/refresh-token", new RefreshTokenRequestDto
        {
            AccessToken = authResult!.AccessToken,
            RefreshToken = authResult.RefreshToken
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Refresh token revocado.", result!.Message);
    }

    [Fact]
    public async Task RefreshToken_BadRequest_TokenInvalido()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        var registerResponse = await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });
        var authResult = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        var response = await _client.PostAsJsonAsync("/auth/refresh-token", new RefreshTokenRequestDto
        {
            AccessToken = authResult!.AccessToken,
            RefreshToken = "token-que-no-existe"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Refresh token inválido.", result!.Message);
    }
    // ─── ME ───────────────────────────────────────────────────────

    [Fact]
    public async Task Me_Ok_TokenValido()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        var registerResponse = await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });
        var authResult = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResult!.AccessToken);

        var response = await _client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<MeResponseDto>();
        Assert.Equal(email, result!.Email);
        Assert.Equal("Customer", result.Role);
    }

    [Fact]
    public async Task Me_Unauthorized_SinToken()
    {
        var response = await _client.GetAsync("/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}