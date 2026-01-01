using MediatR;
namespace OnlineEducation.Api.Events;
public class TestGradedEvent : INotification
{
    public int SubmissionId { get; set; }
    public int StudentId { get; set; }
    public int TestId { get; set; }
    public string TestTitle { get; set; }
    public double Score { get; set; }
}