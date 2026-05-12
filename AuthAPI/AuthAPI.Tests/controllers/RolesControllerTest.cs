using System.Net;
using System.Net.Http.Json;
using AuthAPI.Domain.Entities;
using AuthAPI.Tests.Config;

namespace AuthAPI.Tests.Controllers;

public class RolesControllerTest : IClassFixture<AuthApiWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RolesControllerTest(AuthApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_Ok_RetornaRoles()
    {
        var response = await _client.GetAsync("/roles");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<Role>>();
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.Contains(result, r => r.Name == "Admin");
        Assert.Contains(result, r => r.Name == "Worker");
        Assert.Contains(result, r => r.Name == "Customer");
    }
    [Fact]
    public async Task GetAll_Ok_RetornaListaNoVacia()
    {
        var response = await _client.GetAsync("/roles");
        var result = await response.Content.ReadFromJsonAsync<List<Role>>();

        Assert.NotEmpty(result!);
    }
}