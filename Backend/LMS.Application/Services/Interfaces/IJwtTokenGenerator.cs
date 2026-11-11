using LMS.Domain.Entities;

namespace LMS.Application.Services.Interfaces
{
   public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}
