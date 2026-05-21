using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; private set; }
    public ApplicationUser User { get; private set; } = null!;
    public ICollection<CartItem> Items { get; private set; } = new List<CartItem>();

    private Cart() { }

    public static Cart Create(Guid userId) => new() { UserId = userId };

    public decimal Total => Items.Sum(i => i.Subtotal);

    public void AddItem(Guid productId, int quantity, decimal unitPrice)
    {
        var existing = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existing is not null)
            existing.UpdateQuantity(existing.Quantity + quantity);
        else
            Items.Add(CartItem.Create(Id, productId, quantity, unitPrice));

        SetUpdatedAt();
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is not null)
        {
            ((List<CartItem>)Items).Remove(item);
            SetUpdatedAt();
        }
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw new InvalidOperationException("Item not found in cart.");
        item.UpdateQuantity(quantity);
        SetUpdatedAt();
    }

    public void Clear()
    {
        Items.Clear();
        SetUpdatedAt();
    }
}
