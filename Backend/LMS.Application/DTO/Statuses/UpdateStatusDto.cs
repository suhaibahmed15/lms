

namespace LMS.Application.DTO.Statuses
{
    public class UpdateStatusDto


    {
        public string? Category { get; set; } 

        public string? Name { get; set; }

        public string? Key { get; set; }
        public string? Description { get; set; }

        public int? SortOrder { get; set; }
    }
}
