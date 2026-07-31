using AutoMapper;
using TaskTracker.Application.DTOs.Comment;
using TaskTracker.Application.DTOs.Project;
using TaskTracker.Application.DTOs.TaskItem;
using TaskTracker.Domain.Entities;

namespace TaskTracker.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Project, ProjectDto>()
            .ForMember(d => d.MemberCount, o => o.MapFrom(s => s.Members.Count))
            .ForMember(d => d.TaskCount, o => o.MapFrom(s => s.Tasks.Count));
        CreateMap<Project, ProjectDetailDto>();
        CreateMap<ProjectMember, ProjectMemberDto>()
            .ForMember(d => d.Username, o => o.MapFrom(s => s.User.Username))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email));

        CreateMap<TaskItem, TaskItemDto>()
            .ForMember(d => d.AssigneeName, o => o.MapFrom(s => s.Assignee != null ? s.Assignee.Username : null))
            .ForMember(d => d.CreatedByName, o => o.MapFrom(s => s.CreatedBy.Username))
            .ForMember(d => d.CommentCount, o => o.MapFrom(s => s.Comments.Count));

        CreateMap<Comment, CommentDto>()
            .ForMember(d => d.Username, o => o.MapFrom(s => s.User.Username));
    }
}
