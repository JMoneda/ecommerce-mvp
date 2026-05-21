namespace ECommerce.Application.Cart.DTOs;

public record CartDto(Guid Id, List<CartItemDto> Items, decimal Total);
public record CartItemDto(Guid Id, Guid ProductId, string ProductName, string ImageUrl, int Quantity, decimal UnitPrice, decimal Subtotal);
public record AddToCartRequest(Guid ProductId, int Quantity);
public record UpdateCartItemRequest(int Quantity);
