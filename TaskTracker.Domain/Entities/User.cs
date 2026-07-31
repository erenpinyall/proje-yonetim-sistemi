namespace TaskTracker.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();
    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();
    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    public ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
