

namespace LMS.Application.DTO.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiryAt { get; set; }

        public int UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public int RoleId { get; set; }


        //public string RoleName {  get; set; } = string.Empty;
    }
}
