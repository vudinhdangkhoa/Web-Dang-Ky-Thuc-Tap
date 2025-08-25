using be.DTO.XacThuc;
using be.Enum;
using be.Models;
using be.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace be.controllers.XacThuc
{
    [ApiController]
    [Route("api/[controller]")]
    public class DangNhapController : ControllerBase
    {
        private readonly JWT_Service _jwtService;
        private readonly MyDbContext db;

        public DangNhapController(JWT_Service jwtService, MyDbContext dbContext)
        {
            _jwtService = jwtService;
            db = dbContext;
        }

        [HttpPost("DangNhap")]
        public IActionResult Login([FromBody] LoginModel model)
        {

            User user = db.Users.FirstOrDefault(u => u.Email == model.email && u.Password == model.Password);
            if (user.IsActive == 0)
            {
                return Unauthorized("Tài khoản của bạn đã bị khóa.");
            }
            if (user != null)
            {
                var token = _jwtService.GenerateToken(user, LayTenRole.GetRoleName(user.RoleId));
                var refreshToken = _jwtService.GenerateRefreshToken();
                user.RefreshToken = refreshToken;
                user.RefreshTokenCreate = DateTime.UtcNow;
                user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
                db.SaveChanges();
                return Ok(new { token, refreshToken, userId = user.Id, role = LayTenRole.GetRoleName(user.RoleId), message = "Đăng nhập thành công" });
            }

            return Unauthorized();
        }

        [HttpPost("RefreshToken")]
        public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var refreshToken = request.RefreshToken;
            if (string.IsNullOrEmpty(refreshToken))
            {
                return BadRequest("Refresh token is required.");
            }
            var user = db.Users.FirstOrDefault(u => u.RefreshToken == refreshToken);
            if (user == null)
            {
                return Unauthorized("Invalid refresh token.");
            }

            if (user.RefreshTokenExpires <= DateTime.UtcNow)
            {
                return Unauthorized("Refresh token has expired.");
            }

            var newAccessToken = _jwtService.GenerateToken(user, LayTenRole.GetRoleName(user.RoleId));
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenCreate = DateTime.UtcNow;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
            db.SaveChanges();
            return Ok(new { accessToken = newAccessToken, refreshToken = newRefreshToken });
        }


        [Authorize]
        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirst("UserId")?.Value;
            if (userId == null)
            {
                return Unauthorized("User not found.");
            }

            var user = await db.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.RefreshToken = null;
            user.RefreshTokenCreate = null;
            user.RefreshTokenExpires = null;
            await db.SaveChangesAsync();

            return Ok("Logout successful.");
        }

    }

    
}