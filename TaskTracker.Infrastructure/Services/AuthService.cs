using Microsoft.EntityFrameworkCore;
using TaskTracker.Application.DTOs.Auth;
using TaskTracker.Application.Interfaces;
using TaskTracker.Domain.Entities;
using TaskTracker.Infrastructure.Data;

namespace TaskTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(ApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Email is already registered");

        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            throw new InvalidOperationException("Username is already taken");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user),
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user),
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }
}
