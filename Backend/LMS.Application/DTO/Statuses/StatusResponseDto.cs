

namespace LMS.Application.DTO.Statuses
{
    public class StatusResponseDto
    {

        public int Id { get; set; }

        public string Category { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Key { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }
    }
}
