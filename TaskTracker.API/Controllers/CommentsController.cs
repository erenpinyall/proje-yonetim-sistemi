using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TaskTracker.API.Hubs;
using TaskTracker.Application.DTOs.Comment;
using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.Interfaces;

namespace TaskTracker.API.Controllers;

[ApiController]
[Route("api/tasks/{taskId}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly IHubContext<TaskHub> _hubContext;

    public CommentsController(ICommentService commentService, IHubContext<TaskHub> hubContext)
    {
        _commentService = commentService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<CommentDto>>> GetComments(Guid taskId, [FromQuery] PaginationFilter filter)
    {
        try
        {
            var userId = GetUserId();
            return Ok(await _commentService.GetCommentsAsync(taskId, userId, filter));
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
    public async Task<ActionResult<CommentDto>> CreateComment(Guid taskId, CreateCommentDto dto)
    {
        try
        {
            var userId = GetUserId();
            var result = await _commentService.CreateCommentAsync(taskId, dto, userId);

            await _hubContext.Clients.All.SendAsync("NewComment", result);

            return CreatedAtAction(nameof(GetComments), new { taskId, Page = 1, PageSize = 10 }, result);
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

    [HttpDelete("{commentId}")]
    public async Task<ActionResult> DeleteComment(Guid taskId, Guid commentId)
    {
        try
        {
            var userId = GetUserId();
            await _commentService.DeleteCommentAsync(commentId, userId);
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
