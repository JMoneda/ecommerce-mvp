using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public OrderStatus Status { get; private set; } = OrderStatus.InProcess;
    public decimal Total { get; private set; }
    public ICollection<OrderItem> Items { get; private set; } = new List<OrderItem>();

    private Order() { }

    public static Order Create(Guid userId, IEnumerable<OrderItem> items)
    {
        var itemList = items.ToList();
        return new Order
        {
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            UserId = userId,
            Items = itemList,
            Total = itemList.Sum(i => i.Subtotal)
        };
    }

    public void AdvanceStatus()
    {
        Status = Status switch
        {
            OrderStatus.InProcess => OrderStatus.Paid,
            OrderStatus.Paid => OrderStatus.Shipped,
            OrderStatus.Shipped => OrderStatus.Delivered,
            _ => throw new InvalidOperationException("Order is already delivered.")
        };
        SetUpdatedAt();
    }

    public void SetStatus(OrderStatus status)
    {
        Status = status;
        SetUpdatedAt();
    }
}
