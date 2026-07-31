using TaskTracker.Domain.Enums;

namespace TaskTracker.Application.DTOs.TaskItem;

public class TaskItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public int CommentCount { get; set; }
}
