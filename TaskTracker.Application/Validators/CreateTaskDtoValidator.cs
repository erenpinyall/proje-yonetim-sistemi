using FluentValidation;
using TaskTracker.Application.DTOs.TaskItem;

namespace TaskTracker.Application.Validators;

public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required")
            .MaximumLength(200).WithMessage("Task title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");
    }
}
