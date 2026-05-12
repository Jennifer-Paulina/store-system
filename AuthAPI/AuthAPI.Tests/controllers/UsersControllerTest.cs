using System.Net;
using System.Net.Http.Json;
using AuthAPI.Domain.DTOs;
using AuthAPI.Tests.Config;

namespace AuthAPI.Tests.Controllers;

public class UsersControllerTest : IClassFixture<AuthApiWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UsersControllerTest(AuthApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndGetEmail()
    {
        var email = $"test_{Guid.NewGuid()}@gmail.com";
        await _client.PostAsJsonAsync("/auth/register", new RegisterRequestDto
        {
            Name = "Test User",
            Email = email,
            Password = "123456"
        });
        return email;
    }

    // ─── GET ALL ──────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Ok()
    {
        var response = await _client.GetAsync("/users");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ─── GET BY ID ────────────────────────────────────────────────

    [Fact]
    public async Task GetById_Ok_UsuarioExiste()
    {
        var email = await RegisterAndGetEmail();
        var users = await _client.GetFromJsonAsync<List<UserResponseDto>>("/users");
        var user = users!.First(u => u.Email == email);

        var response = await _client.GetAsync($"/users/{user.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<UserResponseDto>();
        Assert.Equal(email, result!.Email);
    }

    [Fact]
    public async Task GetById_NotFound_UsuarioNoExiste()
    {
        var response = await _client.GetAsync("/users/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Usuario no encontrado.", result!.Message);
    }

    // ─── UPDATE ───────────────────────────────────────────────────

    [Fact]
    public async Task Update_Ok_DatosValidos()
    {
        var email = await RegisterAndGetEmail();
        var users = await _client.GetFromJsonAsync<List<UserResponseDto>>("/users");
        var user = users!.First(u => u.Email == email);

        var response = await _client.PutAsJsonAsync($"/users/{user.Id}", new UpdateUserRequestDto
        {
            Name = "Nombre Actualizado",
            Email = email
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<UserResponseDto>();
        Assert.Equal("Nombre Actualizado", result!.Name);
    }

    [Fact]
    public async Task Update_NotFound_UsuarioNoExiste()
    {
        var response = await _client.PutAsJsonAsync("/users/99999", new UpdateUserRequestDto
        {
            Name = "Nadie",
            Email = "nadie@gmail.com"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Usuario no encontrado.", result!.Message);
    }

    [Fact]
    public async Task Update_BadRequest_EmailYaEnUso()
    {
        var email1 = await RegisterAndGetEmail();
        var email2 = await RegisterAndGetEmail();
        var users = await _client.GetFromJsonAsync<List<UserResponseDto>>("/users");
        var user = users!.First(u => u.Email == email1);

        var response = await _client.PutAsJsonAsync($"/users/{user.Id}", new UpdateUserRequestDto
        {
            Name = "Test",
            Email = email2
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("El email ya está en uso.", result!.Message);
    }

    // ─── CHANGE ROLE ──────────────────────────────────────────────

    [Fact]
    public async Task ChangeRole_Ok_RolValido()
    {
        var email = await RegisterAndGetEmail();
        var users = await _client.GetFromJsonAsync<List<UserResponseDto>>("/users");
        var user = users!.First(u => u.Email == email);

        var response = await _client.PatchAsJsonAsync($"/users/{user.Id}/role", new ChangeRoleRequestDto
        {
            RoleId = 1 // Admin
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<UserResponseDto>();
        Assert.Equal("Admin", result!.Role);
    }

    [Fact]
    public async Task ChangeRole_BadRequest_RolNoExiste()
    {
        var email = await RegisterAndGetEmail();
        var users = await _client.GetFromJsonAsync<List<UserResponseDto>>("/users");
        var user = users!.First(u => u.Email == email);

        var response = await _client.PatchAsJsonAsync($"/users/{user.Id}/role", new ChangeRoleRequestDto
        {
            RoleId = 99999
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Rol no encontrado.", result!.Message);
    }

    // ─── DELETE ───────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Ok_UsuarioExiste()
    {
        var email = await RegisterAndGetEmail();
        var users = await _client.GetFromJsonAsync<List<UserResponseDto>>("/users");
        var user = users!.First(u => u.Email == email);

        var response = await _client.DeleteAsync($"/users/{user.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Delete_NotFound_UsuarioNoExiste()
    {
        var response = await _client.DeleteAsync("/users/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ErrorResponseDto>();
        Assert.Equal("Usuario no encontrado.", result!.Message);
    }
}