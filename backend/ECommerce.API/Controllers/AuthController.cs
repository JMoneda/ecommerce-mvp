using ECommerce.Application.Auth.Commands;
using ECommerce.Application.Auth.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var result = await _mediator.Send(new RegisterCommand(req.FirstName, req.LastName, req.Age,
            req.DateOfBirth, req.Country, req.State, req.City, req.Phone, req.Address, req.Email, req.Password));

        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await _mediator.Send(new LoginCommand(req.Email, req.Password));
        return result.IsSuccess ? Ok(result.Value) : Unauthorized(new { error = result.Error });
    }
}
