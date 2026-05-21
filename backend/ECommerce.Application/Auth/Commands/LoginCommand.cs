using ECommerce.Application.Auth.DTOs;
using ECommerce.Application.Auth;
using ECommerce.Application.Common;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Application.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponse>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand cmd, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(cmd.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, cmd.Password))
            return Result<AuthResponse>.Failure("Invalid credentials.");

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.GenerateTokenAsync(user);

        return Result<AuthResponse>.Success(new AuthResponse(token, user.Email!, $"{user.FirstName} {user.LastName}", roles.FirstOrDefault() ?? "Customer"));
    }
}
