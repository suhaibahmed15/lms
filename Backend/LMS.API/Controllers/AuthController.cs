
using LMS.Application.DTO.Auth;
using LMS.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace LMS.API.Controllers

{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IAuditLogService _auditLogService;

        public AuthController(
            IAuthService authService,
            IAuditLogService auditLogService)
        {
            _authService = authService;
            _auditLogService = auditLogService;
        }

        //POST : api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterRequestDto request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);

                await _auditLogService.LogAsync(
                    result.UserId,
                    "REGISTER",
                    "User",
                    result.UserId,
                    $"New customer account registered: {request.Email}.");

                return Ok(new
                {
                    message = "Registration Successful. ",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequestDto request)
        {
            try
            {
                var result = await _authService.LoginAsync(request);

                await _auditLogService.LogAsync(
                    result.UserId,
                    "LOGIN",
                    "User",
                    result.UserId,
                    $"User {request.Email} successfully logged in.");

                return Ok(new
                {
                    message = "Login Successful",
                    data = result
                });
            }
            catch (Exception ex)
            {
                await _auditLogService.LogAsync(
                    null,
                    "LOGIN_FAILED",
                    "User",
                    null,
                    $"Failed login attempt for {request.Email}: {ex.Message}");

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}