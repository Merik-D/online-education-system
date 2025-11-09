using OnlineEducation.Api.Dtos.Admin;

namespace OnlineEducation.Api.Interfaces;

public interface IAdminService
{
    Task<IEnumerable<PendingSubmissionDto>> GetPendingSubmissionsAsync();
    Task<bool> GradeSubmissionAsync(int submissionId, GradeSubmissionDto gradeDto);
}