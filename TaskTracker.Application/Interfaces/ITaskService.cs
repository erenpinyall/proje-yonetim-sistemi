using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.DTOs.TaskItem;

namespace TaskTracker.Application.Interfaces;

public interface ITaskService
{
    Task<PagedResultDto<TaskItemDto>> GetTasksAsync(Guid projectId, Guid userId, PaginationFilter filter);
    Task<TaskItemDto> GetTaskByIdAsync(Guid taskId, Guid userId);
    Task<TaskItemDto> CreateTaskAsync(Guid projectId, CreateTaskDto dto, Guid userId);
    Task<TaskItemDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto, Guid userId);
    Task DeleteTaskAsync(Guid taskId, Guid userId);
}
