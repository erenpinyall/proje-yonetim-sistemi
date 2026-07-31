using FluentValidation;
using TaskTracker.Application.DTOs.Comment;

namespace TaskTracker.Application.Validators;

public class CreateCommentDtoValidator : AbstractValidator<CreateCommentDto>
{
    public CreateCommentDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content is required")
            .MaximumLength(2000).WithMessage("Comment must not exceed 2000 characters");
    }
}
