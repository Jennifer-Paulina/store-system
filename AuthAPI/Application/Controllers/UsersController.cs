using AuthAPI.Application.Logic;
using AuthAPI.Domain.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace AuthAPI.Application.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly UserLogic _userLogic;

    public UsersController(UserLogic userLogic)
    {
        _userLogic = userLogic;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var users = await _userLogic.GetAllAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var user = await _userLogic.GetByIdAsync(id);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return NotFound(new ErrorResponseDto { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequestDto request)
    {
        try
        {
            var user = await _userLogic.UpdateAsync(id, request);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _userLogic.DeleteAsync(id);
            return Ok(new { message = "Usuario eliminado correctamente." });
        }
        catch (Exception ex)
        {
            return NotFound(new ErrorResponseDto { Message = ex.Message });
        }
    }

    [HttpPatch("{id}/role")]
    public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequestDto request)
    {
        try
        {
            var user = await _userLogic.ChangeRoleAsync(id, request);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new ErrorResponseDto { Message = ex.Message });
        }
    }
}