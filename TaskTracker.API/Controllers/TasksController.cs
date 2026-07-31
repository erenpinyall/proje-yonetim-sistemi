using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TaskTracker.API.Hubs;
using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.DTOs.TaskItem;
using TaskTracker.Application.Interfaces;

namespace TaskTracker.API.Controllers;

[ApiController]
[Route("api/projects/{projectId}/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IHubContext<TaskHub> _hubContext;

    public TasksController(ITaskService taskService, IHubContext<TaskHub> hubContext)
    {
        _taskService = taskService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskItemDto>>> GetTasks(Guid projectId, [FromQuery] PaginationFilter filter)
    {
        try
        {
            var userId = GetUserId();
            return Ok(await _taskService.GetTasksAsync(projectId, userId, filter));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("{taskId}")]
    public async Task<ActionResult<TaskItemDto>> GetTask(Guid projectId, Guid taskId)
    {
        try
        {
            var userId = GetUserId();
            return Ok(await _taskService.GetTaskByIdAsync(taskId, userId));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> CreateTask(Guid projectId, CreateTaskDto dto)
    {
        try
        {
            var userId = GetUserId();
            var result = await _taskService.CreateTaskAsync(projectId, dto, userId);

            await _hubContext.Clients.Group($"project_{projectId}")
                .SendAsync("TaskCreated", result);

            return CreatedAtAction(nameof(GetTask), new { projectId, taskId = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{taskId}")]
    public async Task<ActionResult<TaskItemDto>> UpdateTask(Guid projectId, Guid taskId, UpdateTaskDto dto)
    {
        try
        {
            var userId = GetUserId();
            var result = await _taskService.UpdateTaskAsync(taskId, dto, userId);

            await _hubContext.Clients.Group($"project_{projectId}")
                .SendAsync("TaskUpdated", result);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{taskId}")]
    public async Task<ActionResult> DeleteTask(Guid projectId, Guid taskId)
    {
        try
        {
            var userId = GetUserId();
            await _taskService.DeleteTaskAsync(taskId, userId);

            await _hubContext.Clients.Group($"project_{projectId}")
                .SendAsync("TaskDeleted", taskId);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException();
        return Guid.Parse(claim);
    }
}
