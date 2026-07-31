using TaskTracker.Domain.Enums;

namespace TaskTracker.Domain.Entities;

public class ProjectMember
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public ProjectRole Role { get; set; }
}
