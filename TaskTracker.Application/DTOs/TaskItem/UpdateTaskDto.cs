using TaskTracker.Domain.Enums;

namespace TaskTracker.Application.DTOs.TaskItem;

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public Guid? AssigneeId { get; set; }
}
