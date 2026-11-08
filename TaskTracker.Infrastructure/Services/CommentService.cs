using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using TaskTracker.Application.DTOs.Comment;
using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.Interfaces;
using TaskTracker.Domain.Entities;
using TaskTracker.Infrastructure.Data;

namespace TaskTracker.Infrastructure.Services;

public class CommentService : ICommentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CommentService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<CommentDto>> GetCommentsAsync(Guid taskId, Guid userId, PaginationFilter filter)
    {
        var taskItem = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Task not found");

        await EnsureProjectAccess(taskItem.ProjectId, userId);

        var query = _context.Comments
            .Include(c => c.User)
            .Where(c => c.TaskItemId == taskId);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ProjectTo<CommentDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResultDto<CommentDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<CommentDto> CreateCommentAsync(Guid taskId, CreateCommentDto dto, Guid userId)
    {
        var taskItem = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Task not found");

        await EnsureProjectAccess(taskItem.ProjectId, userId);

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            Content = dto.Content,
            TaskItemId = taskId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        await _context.Entry(comment).Reference(c => c.User).LoadAsync();

        return _mapper.Map<CommentDto>(comment);
    }

    public async Task DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId)
            ?? throw new KeyNotFoundException("Comment not found");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments");

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureProjectAccess(Guid projectId, Guid userId)
    {
        var hasAccess = await _context.Projects
            .Include(p => p.Members)
            .AnyAsync(p => p.Id == projectId && (p.OwnerId == userId || p.Members.Any(m => m.UserId == userId)));

        if (!hasAccess)
            throw new UnauthorizedAccessException("You do not have access to this project");
    }
}
