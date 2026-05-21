using ECommerce.Domain.Enums;

namespace ECommerce.Application.Orders.DTOs;

public record OrderDto(Guid Id, string OrderNumber, OrderStatus Status, decimal Total,
    DateTime CreatedAt, List<OrderItemDto> Items, string? CustomerName);

public record OrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal Subtotal);
