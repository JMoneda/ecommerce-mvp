using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal Subtotal => Quantity * UnitPrice;

    private OrderItem() { }

    public static OrderItem Create(Guid productId, int quantity, decimal unitPrice) =>
        new() { ProductId = productId, Quantity = quantity, UnitPrice = unitPrice };
}
