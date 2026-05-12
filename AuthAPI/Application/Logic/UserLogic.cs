using AuthAPI.Domain.DTOs;
using AuthAPI.Domain.Entities;
using AuthAPI.Domain.Interfaces;

namespace AuthAPI.Application.Logic;

public class UserLogic
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;

    public UserLogic(IUserRepository userRepository, IRoleRepository roleRepository)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserResponseDto> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new Exception("Usuario no encontrado.");
        return MapToDto(user);
    }

    public async Task<UserResponseDto> UpdateAsync(int id, UpdateUserRequestDto request)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new Exception("Usuario no encontrado.");

        if (request.Email != user.Email && await _userRepository.ExistsAsync(request.Email))
            throw new Exception("El email ya está en uso.");

        user.Name = request.Name;
        user.Email = request.Email;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new Exception("Usuario no encontrado.");
        await _userRepository.DeleteAsync(id);
    }

    public async Task<UserResponseDto> ChangeRoleAsync(int id, ChangeRoleRequestDto request)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new Exception("Usuario no encontrado.");

        var role = await _roleRepository.GetByIdAsync(request.RoleId)
            ?? throw new Exception("Rol no encontrado.");

        user.RoleId = role.Id;
        user.Role = role;

        await _userRepository.UpdateAsync(user);
        return MapToDto(user);
    }

    private static UserResponseDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role.Name,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}