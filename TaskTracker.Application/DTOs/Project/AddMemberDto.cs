using TaskTracker.Domain.Enums;

namespace TaskTracker.Application.DTOs.Project;

public class AddMemberDto
{
    public string Email { get; set; } = string.Empty;
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}
