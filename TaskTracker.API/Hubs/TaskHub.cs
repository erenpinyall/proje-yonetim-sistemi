using Microsoft.AspNetCore.SignalR;

namespace TaskTracker.API.Hubs;

public class TaskHub : Hub
{
    public async Task JoinProjectGroup(string projectId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"project_{projectId}");
    }

    public async Task LeaveProjectGroup(string projectId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project_{projectId}");
    }
}
