namespace ECommerce.Application.Auth.DTOs;

public record RegisterRequest(
    string FirstName, string LastName, int Age, DateTime DateOfBirth,
    string Country, string State, string City, string Phone,
    string Address, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, string Email, string FullName, string Role);
