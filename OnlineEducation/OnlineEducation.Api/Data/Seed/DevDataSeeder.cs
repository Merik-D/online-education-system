using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Models;
using OnlineEducation.Api.Models.Lessons;
namespace OnlineEducation.Api.Data.Seed;
public static class DevDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var context = sp.GetRequiredService<ApplicationDbContext>();
        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var userManager = sp.GetRequiredService<UserManager<User>>();
        await context.Database.MigrateAsync();
        string[] roles = new[] { "Admin", "Instructor", "Student" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(role));
            }
        }
        async Task<User> EnsureUserAsync(string email, string fullName, string password, params string[] addRoles)
        {
            var user = await userManager.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    EmailConfirmed = true
                };
                var createResult = await userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException($"Failed creating user {email}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                }
            }
            foreach (var r in addRoles)
            {
                if (!await userManager.IsInRoleAsync(user, r))
                {
                    await userManager.AddToRoleAsync(user, r);
                }
            }
            return user;
        }
        var admin = await EnsureUserAsync("admin@example.com", "Admin User", "Passw0rd!", "Admin");
        var instructor = await EnsureUserAsync("instructor1@example.com", "Jane Instructor", "Passw0rd!", "Instructor");
        var student1 = await EnsureUserAsync("student1@example.com", "John Student", "Passw0rd!", "Student");
        var student2 = await EnsureUserAsync("student2@example.com", "Mary Student", "Passw0rd!", "Student");
        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category { Name = "Development" },
                new Category { Name = "Design" },
                new Category { Name = "Business" }
            );
            await context.SaveChangesAsync();
        }
        var devCategory = await context.Categories.FirstAsync(c => c.Name == "Development");
        var designCategory = await context.Categories.FirstAsync(c => c.Name == "Design");
        if (!await context.Courses.AnyAsync())
        {
            var course1 = new Course
            {
                Title = "C# for Beginners",
                Description = "Learn the fundamentals of C# and .NET",
                Level = CourseLevel.Beginner,
                InstructorId = instructor.Id,
                CategoryId = devCategory.Id,
            };
            var mod1 = new Module { Title = "Getting Started", Order = 1, Course = course1 };
            var mod2 = new Module { Title = "OOP Basics", Order = 2, Course = course1 };
            mod1.Lessons.Add(new VideoLesson { Title = "Intro to C#", Order = 1, Module = mod1, VideoUrl = "https://www.youtube.com/embed/GhQdlIFylQ8" });
            mod1.Lessons.Add(new TextLesson { Title = "Setting up .NET SDK", Order = 2, Module = mod1, TextContent = "Install .NET SDK and create your first app." });
            var test1 = new Test
            {
                Title = "Module 1 Quiz",
                Module = mod1,
                StrategyType = GradingStrategyType.Auto
            };
            var q1 = new Question { Text = "What is C#?", Type = QuestionType.Text, Order = 1, Test = test1 };
            var q2 = new Question { Text = ".NET CLI command to new console app?", Type = QuestionType.SingleChoice, Order = 2, Test = test1 };
            var o21 = new Option { Text = "dotnet new console", IsCorrect = true, Question = q2 };
            var o22 = new Option { Text = "dotnet init app", IsCorrect = false, Question = q2 };
            var o23 = new Option { Text = "npm init", IsCorrect = false, Question = q2 };
            test1.Questions.Add(q1);
            test1.Questions.Add(q2);
            q2.Options.Add(o21); q2.Options.Add(o22); q2.Options.Add(o23);
            mod2.Lessons.Add(new VideoLesson { Title = "Classes and Objects", Order = 1, Module = mod2, VideoUrl = "https://www.youtube.com/embed/bJNpZF_iTJ0" });
            mod2.Lessons.Add(new TextLesson { Title = "Properties and Methods", Order = 2, Module = mod2, TextContent = "Learn encapsulation and behavior." });
            var test2 = new Test
            {
                Title = "OOP Basics Quiz",
                Module = mod2,
                StrategyType = GradingStrategyType.Auto
            };
            var q3 = new Question { Text = "What is a class?", Type = QuestionType.Text, Order = 1, Test = test2 };
            var q4 = new Question { Text = "Which keyword defines a property?", Type = QuestionType.SingleChoice, Order = 2, Test = test2 };
            var o41 = new Option { Text = "public", IsCorrect = true, Question = q4 };
            var o42 = new Option { Text = "private", IsCorrect = false, Question = q4 };
            var o43 = new Option { Text = "protected", IsCorrect = false, Question = q4 };
            test2.Questions.Add(q3);
            test2.Questions.Add(q4);
            q4.Options.Add(o41); q4.Options.Add(o42); q4.Options.Add(o43);
            course1.Modules.Add(mod1);
            course1.Modules.Add(mod2);
            var course2 = new Course
            {
                Title = "Design Fundamentals",
                Description = "Learn core design principles and color theory",
                Level = CourseLevel.Beginner,
                InstructorId = instructor.Id,
                CategoryId = designCategory.Id,
            };
            var dmod1 = new Module { Title = "Principles", Order = 1, Course = course2 };
            dmod1.Lessons.Add(new TextLesson { Title = "Contrast, Repetition, Alignment, Proximity", Order = 1, Module = dmod1, TextContent = "CRAP principles overview" });
            dmod1.Lessons.Add(new VideoLesson { Title = "Color Theory", Order = 2, Module = dmod1, VideoUrl = "https://videos.example.com/design/colors.mp4" });
            var test3 = new Test
            {
                Title = "Design Principles Quiz",
                Module = dmod1,
                StrategyType = GradingStrategyType.Auto
            };
            var q5 = new Question { Text = "What does CRAP stand for?", Type = QuestionType.Text, Order = 1, Test = test3 };
            var q6 = new Question { Text = "Which is NOT a CRAP principle?", Type = QuestionType.SingleChoice, Order = 2, Test = test3 };
            var o61 = new Option { Text = "Contrast", IsCorrect = false, Question = q6 };
            var o62 = new Option { Text = "Balance", IsCorrect = true, Question = q6 };
            var o63 = new Option { Text = "Alignment", IsCorrect = false, Question = q6 };
            test3.Questions.Add(q5);
            test3.Questions.Add(q6);
            q6.Options.Add(o61); q6.Options.Add(o62); q6.Options.Add(o63);
            course2.Modules.Add(dmod1);
            context.Courses.AddRange(course1, course2);
            await context.SaveChangesAsync();
        }
        var csharp = await context.Courses.Include(c => c.Modules).ThenInclude(m => m.Lessons)
            .FirstAsync(c => c.Title == "C# for Beginners");
        var design = await context.Courses.Include(c => c.Modules).ThenInclude(m => m.Lessons)
            .FirstAsync(c => c.Title == "Design Fundamentals");
        if (!await context.Enrollments.AnyAsync())
        {
            var e1 = new Enrollment { StudentId = student1.Id, CourseId = csharp.Id, Progress = 0 };
            var e2 = new Enrollment { StudentId = student2.Id, CourseId = csharp.Id, Progress = 0 };
            var e3 = new Enrollment { StudentId = student1.Id, CourseId = design.Id, Progress = 0 };
            context.Enrollments.AddRange(e1, e2, e3);
            await context.SaveChangesAsync();
        }
        if (!await context.LessonCompletions.AnyAsync())
        {
            var firstTwoLessons = csharp.Modules
                .OrderBy(m => m.Order)
                .SelectMany(m => m.Lessons)
                .OrderBy(l => l.Order)
                .Take(2)
                .ToList();
            foreach (var lesson in firstTwoLessons)
            {
                context.LessonCompletions.Add(new LessonCompletion
                {
                    StudentId = student1.Id,
                    LessonId = lesson.Id,
                    CompletedAt = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }
        if (!await context.Reviews.AnyAsync())
        {
            context.Reviews.AddRange(
                new Review { StudentId = student1.Id, CourseId = csharp.Id, Rating = 5, Comment = "Great intro course!" },
                new Review { StudentId = student2.Id, CourseId = csharp.Id, Rating = 4, Comment = "Clear explanations." }
            );
            await context.SaveChangesAsync();
        }
        if (!await context.Notifications.AnyAsync())
        {
            context.Notifications.AddRange(
                new Notification { UserId = student1.Id, Title = "Welcome", Message = "Welcome to C# for Beginners!" },
                new Notification { UserId = instructor.Id, Title = "Instructor", Message = "You have 2 new enrollments." }
            );
            await context.SaveChangesAsync();
        }
        if (!await context.CourseInteractions.AnyAsync())
        {
            context.CourseInteractions.AddRange(
                new CourseInteraction { StudentId = student1.Id, CourseId = csharp.Id, InteractionType = "view", TimeSpentMinutes = 15 },
                new CourseInteraction { StudentId = student1.Id, CourseId = csharp.Id, InteractionType = "enroll", TimeSpentMinutes = 0 },
                new CourseInteraction { StudentId = student2.Id, CourseId = csharp.Id, InteractionType = "view", TimeSpentMinutes = 7 }
            );
            await context.SaveChangesAsync();
        }
        if (!await context.CourseRecommendations.AnyAsync())
        {
            context.CourseRecommendations.AddRange(
                new CourseRecommendation { StudentId = student1.Id, CourseId = design.Id, Score = 0.82, Reason = "category_match", Viewed = false, Acted = false, ExpiresAt = DateTime.UtcNow.AddDays(30) },
                new CourseRecommendation { StudentId = student2.Id, CourseId = design.Id, Score = 0.65, Reason = "trending", Viewed = true, Acted = false, ExpiresAt = DateTime.UtcNow.AddDays(30) }
            );
            await context.SaveChangesAsync();
        }
        if (!await context.StudentSubmissions.AnyAsync())
        {
            var moduleWithQuiz = await context.Modules.Include(m => m.Test)!
                .ThenInclude(t => t!.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(m => m.CourseId == csharp.Id && m.Test != null);
            if (moduleWithQuiz?.Test != null)
            {
                var test = moduleWithQuiz.Test;
                var submission = new StudentSubmission
                {
                    StudentId = student1.Id,
                    TestId = test.Id,
                    Status = SubmissionStatus.Graded,
                    Score = 90
                };
                foreach (var q in test.Questions.OrderBy(q => q.Order))
                {
                    var sa = new StudentAnswer
                    {
                        QuestionId = q.Id,
                        StudentSubmission = submission,
                        AnswerText = q.Type == QuestionType.Text ? "A modern OOP language by Microsoft" : null
                    };
                    if (q.Options?.Any() == true)
                    {
                        var correct = q.Options.FirstOrDefault(o => o.IsCorrect) ?? q.Options.First();
                        sa.SelectedOptions.Add(new StudentAnswerOption { OptionId = correct.Id });
                    }
                    submission.Answers.Add(sa);
                }
                context.StudentSubmissions.Add(submission);
                await context.SaveChangesAsync();
            }
        }
        var modulesWithoutTests = await context.Modules
            .Where(m => m.Test == null)
            .ToListAsync();
        foreach (var module in modulesWithoutTests)
        {
            var testTitle = $"{module.Title} Quiz";
            var test = new Test
            {
                Title = testTitle,
                ModuleId = module.Id,
                StrategyType = GradingStrategyType.Auto
            };
            var question1 = new Question
            {
                Text = $"What did you learn in {module.Title}?",
                Type = QuestionType.Text,
                Order = 1,
                Test = test
            };
            var question2 = new Question
            {
                Text = $"Which concept from {module.Title} is most important?",
                Type = QuestionType.SingleChoice,
                Order = 2,
                Test = test
            };
            var option1 = new Option { Text = "First concept", IsCorrect = true, Question = question2 };
            var option2 = new Option { Text = "Second concept", IsCorrect = false, Question = question2 };
            var option3 = new Option { Text = "Third concept", IsCorrect = false, Question = question2 };
            test.Questions.Add(question1);
            test.Questions.Add(question2);
            question2.Options.Add(option1);
            question2.Options.Add(option2);
            question2.Options.Add(option3);
            module.Test = test;
        }
        if (modulesWithoutTests.Count > 0)
        {
            await context.SaveChangesAsync();
        }
    }
}