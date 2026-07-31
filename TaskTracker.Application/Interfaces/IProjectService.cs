using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.DTOs.Project;
namespace TaskTracker.Application.Interfaces;

public interface IProjectService
{
    Task<PagedResultDto<ProjectDto>> GetProjectsAsync(Guid userId, PaginationFilter filter);
    Task<ProjectDetailDto> GetProjectByIdAsync(Guid projectId, Guid userId);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, Guid userId);
    Task AddMemberAsync(Guid projectId, AddMemberDto dto, Guid userId);
    Task RemoveMemberAsync(Guid projectId, Guid memberUserId, Guid userId);
    Task DeleteProjectAsync(Guid projectId, Guid userId);
}
