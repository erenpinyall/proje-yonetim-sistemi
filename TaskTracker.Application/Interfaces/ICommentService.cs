using TaskTracker.Application.DTOs.Comment;
using TaskTracker.Application.DTOs.Common;

namespace TaskTracker.Application.Interfaces;

public interface ICommentService
{
    Task<PagedResultDto<CommentDto>> GetCommentsAsync(Guid taskId, Guid userId, PaginationFilter filter);
    Task<CommentDto> CreateCommentAsync(Guid taskId, CreateCommentDto dto, Guid userId);
    Task DeleteCommentAsync(Guid commentId, Guid userId);
}
