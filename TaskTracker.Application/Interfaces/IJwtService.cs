using TaskTracker.Domain.Entities;

namespace TaskTracker.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
