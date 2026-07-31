using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.DTOs.TaskItem;
using TaskTracker.Application.Interfaces;
using TaskTracker.Infrastructure.Data;

namespace TaskTracker.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public TaskService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<TaskItemDto>> GetTasksAsync(Guid projectId, Guid userId, PaginationFilter filter)
    {
        await EnsureProjectAccess(projectId, userId);

        var query = _context.TaskItems
            .Include(t => t.Assignee)
            .Include(t => t.CreatedBy)
            .Include(t => t.Comments)
            .Where(t => t.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(t =>
                t.Title.Contains(filter.Search) ||
                (t.Description != null && t.Description.Contains(filter.Search)));

        var totalCount = await query.CountAsync();

        query = (filter.SortBy?.ToLower()) switch
        {
            "title" => filter.SortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "status" => filter.SortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "priority" => filter.SortDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "createdat" => filter.SortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ProjectTo<TaskItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResultDto<TaskItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<TaskItemDto> GetTaskByIdAsync(Guid taskId, Guid userId)
    {
        var task = await _context.TaskItems
            .Include(t => t.Assignee)
            .Include(t => t.CreatedBy)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Task not found");

        await EnsureProjectAccess(task.ProjectId, userId);

        return _mapper.Map<TaskItemDto>(task);
    }

    public async Task<TaskItemDto> CreateTaskAsync(Guid projectId, CreateTaskDto dto, Guid userId)
    {
        await EnsureProjectAccess(projectId, userId);

        if (dto.AssigneeId.HasValue)
        {
            var isMember = await _context.ProjectMembers
                .AnyAsync(m => m.ProjectId == projectId && m.UserId == dto.AssigneeId.Value);
            if (!isMember)
                throw new InvalidOperationException("Assignee must be a member of the project");
        }

        var task = new Domain.Entities.TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            ProjectId = projectId,
            AssigneeId = dto.AssigneeId,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        return await GetTaskByIdAsync(task.Id, userId);
    }

    public async Task<TaskItemDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto, Guid userId)
    {
        var task = await _context.TaskItems
            .Include(t => t.Assignee)
            .Include(t => t.CreatedBy)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Task not found");

        await EnsureProjectAccess(task.ProjectId, userId);

        if (dto.Title != null)
            task.Title = dto.Title;
        if (dto.Description != null)
            task.Description = dto.Description;
        if (dto.Status.HasValue)
            task.Status = dto.Status.Value;
        if (dto.Priority.HasValue)
            task.Priority = dto.Priority.Value;
        if (dto.AssigneeId.HasValue)
        {
            var isMember = await _context.ProjectMembers
                .AnyAsync(m => m.ProjectId == task.ProjectId && m.UserId == dto.AssigneeId.Value);
            if (!isMember)
                throw new InvalidOperationException("Assignee must be a member of the project");
            task.AssigneeId = dto.AssigneeId;
        }

        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return _mapper.Map<TaskItemDto>(task);
    }

    public async Task DeleteTaskAsync(Guid taskId, Guid userId)
    {
        var task = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Task not found");

        await EnsureProjectAccess(task.ProjectId, userId);

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureProjectAccess(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.OwnerId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You do not have access to this project");
    }
}
