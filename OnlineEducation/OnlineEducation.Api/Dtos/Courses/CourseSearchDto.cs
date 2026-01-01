namespace OnlineEducation.Api.Dtos.Courses;
public class CourseSearchDto
{
    public string? SearchTerm { get; set; }
    public int? CategoryId { get; set; }
    public int? InstructorId { get; set; }
    public int? Level { get; set; }
    public decimal? MinRating { get; set; }
    public string? SortBy { get; set; }
    public bool? IsDescending { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}
public class CourseSearchResultDto
{
    public List<CourseDto> Courses { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}