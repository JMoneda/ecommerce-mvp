using ECommerce.Domain.Entities;

namespace ECommerce.Application.Auth;

public interface ITokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user);
}
