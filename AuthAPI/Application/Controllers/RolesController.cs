using AuthAPI.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using AuthAPI.Domain.DTOs;

namespace AuthAPI.Application.Controllers;

[ApiController]
[Route("roles")]
public class RolesController : ControllerBase
{
    private readonly IRoleRepository _roleRepository;

    public RolesController(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var roles = await _roleRepository.GetAllAsync();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
    }
}