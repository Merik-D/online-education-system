namespace OnlineEducation.Api.Dtos.Learning;
public class TestDetailsDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
    public bool IsCompleted { get; set; } = false;
    public double? Score { get; set; }
}