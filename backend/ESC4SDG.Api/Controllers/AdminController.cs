using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ESC4SDG.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    /// <summary>
    /// Admin panel dashboard özeti. Sadece Admin rolü erişebilir.
    /// </summary>
    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        return Ok(new
        {
            message = "Admin dashboard",
            courses = 0,
            users = 0,
            timestamp = DateTime.UtcNow
        });
    }
}
