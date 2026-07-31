FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY TaskTracker.slnx ./
COPY TaskTracker.Domain/TaskTracker.Domain.csproj TaskTracker.Domain/
COPY TaskTracker.Application/TaskTracker.Application.csproj TaskTracker.Application/
COPY TaskTracker.Infrastructure/TaskTracker.Infrastructure.csproj TaskTracker.Infrastructure/
COPY TaskTracker.API/TaskTracker.API.csproj TaskTracker.API/
RUN dotnet restore

COPY . .
WORKDIR /src/TaskTracker.API
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskTracker.API.dll"]
