using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PaintShopBackEnd.WebApi.Models.Auth;

namespace PaintShopBackEnd.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _users;
    private readonly SignInManager<IdentityUser> _signIn;
    private readonly IAntiforgery _antiforgery;
    private readonly IWebHostEnvironment _environment;

    public AuthController(UserManager<IdentityUser> users, SignInManager<IdentityUser> signIn,
        IAntiforgery antiforgery, IWebHostEnvironment environment)
    {
        _users = users;
        _signIn = signIn;
        _antiforgery = antiforgery;
        _environment = environment;
    }

    [HttpGet("csrf")]
    [AllowAnonymous]
    public IActionResult Csrf()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
        {
            HttpOnly = false,
            SameSite = SameSiteMode.Lax,
            Secure = !_environment.IsDevelopment() || Request.IsHttps,
            Path = "/"
        });
        return NoContent();
    }

    [HttpGet("me")]
    [AllowAnonymous]
    public IActionResult Me()
    {
        return Ok(new { email = User.Identity?.IsAuthenticated == true ? User.Identity.Name : null, isAdmin = User.IsInRole("Admin") });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _users.FindByEmailAsync(request.Email.Trim());
        if (user is null)
            return Unauthorized(new { message = "Неверный email или пароль." });

        var result = await _signIn.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded || !await _users.IsInRoleAsync(user, "Admin"))
            return Unauthorized(new { message = "Неверный email или пароль." });

        await _signIn.SignInAsync(user, isPersistent: false);
        return NoContent();
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _signIn.SignOutAsync();
        return NoContent();
    }
}
