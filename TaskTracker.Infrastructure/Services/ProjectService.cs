using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using TaskTracker.Application.DTOs.Common;
using TaskTracker.Application.DTOs.Project;
using TaskTracker.Application.Interfaces;
using TaskTracker.Domain.Entities;
using TaskTracker.Domain.Enums;
using TaskTracker.Infrastructure.Data;

namespace TaskTracker.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProjectService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ProjectDto>> GetProjectsAsync(Guid userId, PaginationFilter filter)
    {
        var query = _context.Projects
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .Where(p => p.OwnerId == userId || p.Members.Any(m => m.UserId == userId));

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(p => p.Name.Contains(filter.Search));

        var totalCount = await query.CountAsync();

        query = (filter.SortBy?.ToLower()) switch
        {
            "name" => filter.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "createdat" => filter.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ProjectTo<ProjectDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResultDto<ProjectDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ProjectDetailDto> GetProjectByIdAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.OwnerId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You do not have access to this project");

        return _mapper.Map<ProjectDetailDto>(project);
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, Guid userId)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow
        };

        project.Members.Add(new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            UserId = userId,
            Role = ProjectRole.Admin
        });

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task AddMemberAsync(Guid projectId, AddMemberDto dto, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        var membership = project.Members.FirstOrDefault(m => m.UserId == userId);
        if (membership == null || membership.Role != ProjectRole.Admin)
            throw new UnauthorizedAccessException("Only project admins can add members");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new KeyNotFoundException("User not found with this email");

        if (project.Members.Any(m => m.UserId == user.Id))
            throw new InvalidOperationException("User is already a member");

        // DbSet üzerinden ekle: mevcut bir projenin koleksiyonuna eklenen
        // entity, dolu anahtar yüzünden EF tarafından "Modified" sanılıyordu.
        _context.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = projectId,
            UserId = user.Id,
            Role = dto.Role
        });

        await _context.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(Guid projectId, Guid memberUserId, Guid userId)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        var membership = project.Members.FirstOrDefault(m => m.UserId == userId);
        if (membership == null || membership.Role != ProjectRole.Admin)
            throw new UnauthorizedAccessException("Only project admins can remove members");

        var memberToRemove = project.Members.FirstOrDefault(m => m.UserId == memberUserId)
            ?? throw new KeyNotFoundException("Member not found");

        if (memberToRemove.Role == ProjectRole.Admin)
            throw new InvalidOperationException("Cannot remove an admin");

        _context.ProjectMembers.Remove(memberToRemove);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteProjectAsync(Guid projectId, Guid userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        if (project.OwnerId != userId)
            throw new UnauthorizedAccessException("Only the project owner can delete the project");

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }
}
