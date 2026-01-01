using System.ComponentModel.DataAnnotations;
namespace OnlineEducation.Api.Dtos.Admin;
public class GradeSubmissionDto
{
    [Range(0, 100)]
    public double Score { get; set; }
}