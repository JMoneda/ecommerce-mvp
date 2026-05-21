using ECommerce.Application.Auth.DTOs;
using ECommerce.Application.Common;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using ECommerce.Application.Auth;

namespace ECommerce.Application.Auth.Commands;

public record RegisterCommand(
    string FirstName, string LastName, int Age, DateTime DateOfBirth,
    string Country, string State, string City, string Phone,
    string Address, string Email, string Password) : IRequest<Result<AuthResponse>>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand cmd, CancellationToken ct)
    {
        var user = new ApplicationUser
        {
            UserName = cmd.Email,
            Email = cmd.Email,
            EmailConfirmed = true,
            FirstName = cmd.FirstName,
            LastName = cmd.LastName,
            Age = cmd.Age,
            DateOfBirth = cmd.DateOfBirth,
            Country = cmd.Country,
            State = cmd.State,
            City = cmd.City,
            Phone = cmd.Phone,
            Address = cmd.Address
        };

        var result = await _userManager.CreateAsync(user, cmd.Password);
        if (!result.Succeeded)
            return Result<AuthResponse>.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, "Customer");
        var token = await _tokenService.GenerateTokenAsync(user);

        return Result<AuthResponse>.Success(new AuthResponse(token, user.Email!, $"{user.FirstName} {user.LastName}", "Customer"));
    }
}
