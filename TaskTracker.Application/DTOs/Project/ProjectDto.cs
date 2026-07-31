using TaskTracker.Domain.Enums;

namespace TaskTracker.Application.DTOs.Project;

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int MemberCount { get; set; }
    public int TaskCount { get; set; }
}

public class ProjectDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid OwnerId { get; set; }
    public List<ProjectMemberDto> Members { get; set; } = new();
}

public class ProjectMemberDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ProjectRole Role { get; set; }
}

