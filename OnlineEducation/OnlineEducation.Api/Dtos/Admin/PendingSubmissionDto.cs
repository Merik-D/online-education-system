namespace OnlineEducation.Api.Dtos.Admin;
public class PendingSubmissionDto
{
    public int SubmissionId { get; set; }
    public string TestTitle { get; set; }
    public string StudentName { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<StudentAnswerDto> Answers { get; set; } = new();
}