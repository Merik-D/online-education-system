using FluentValidation;
using OnlineEducation.Api.Dtos.Courses;

namespace OnlineEducation.Api.Validators.Courses;

public class CreateCourseValidator : AbstractValidator<CreateCourseDto>
{
    public CreateCourseValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Course title is required")
            .MinimumLength(3).WithMessage("Course title must be at least 3 characters long")
            .MaximumLength(200).WithMessage("Course title cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Course description is required")
            .MinimumLength(10).WithMessage("Course description must be at least 10 characters long")
            .MaximumLength(5000).WithMessage("Course description cannot exceed 5000 characters");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category ID must be a valid positive number");

        RuleFor(x => x.Level)
            .IsInEnum().WithMessage("Invalid course level");
    }
}
