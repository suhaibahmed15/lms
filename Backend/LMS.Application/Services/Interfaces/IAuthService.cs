using LMS.Application.DTO.Auth;

namespace LMS.Application.Services.Interfaces
{
    public interface IAuthService
    {

        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);

        Task<AuthResponseDto> LoginAsync (LoginRequestDto loginRequest);
    }
}




