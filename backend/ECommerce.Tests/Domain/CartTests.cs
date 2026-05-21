using ECommerce.Domain.Entities;

namespace ECommerce.Tests.Domain;

public class CartTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid ProductId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldInitializeWithUserId()
    {
        var cart = Cart.Create(UserId);
        Assert.Equal(UserId, cart.UserId);
        Assert.Empty(cart.Items);
        Assert.Equal(0m, cart.Total);
    }

    [Fact]
    public void AddItem_ShouldAddNewItem()
    {
        var cart = Cart.Create(UserId);
        cart.AddItem(ProductId, 2, 50_000m);
        Assert.Single(cart.Items);
        Assert.Equal(100_000m, cart.Total);
    }

    [Fact]
    public void AddItem_SamProduct_ShouldIncreaseQuantity()
    {
        var cart = Cart.Create(UserId);
        cart.AddItem(ProductId, 2, 50_000m);
        cart.AddItem(ProductId, 3, 50_000m);
        Assert.Single(cart.Items);
        Assert.Equal(5, cart.Items.First().Quantity);
    }

    [Fact]
    public void RemoveItem_ShouldRemoveFromCart()
    {
        var cart = Cart.Create(UserId);
        cart.AddItem(ProductId, 1, 50_000m);
        cart.RemoveItem(ProductId);
        Assert.Empty(cart.Items);
    }

    [Fact]
    public void Clear_ShouldEmptyCart()
    {
        var cart = Cart.Create(UserId);
        cart.AddItem(ProductId, 2, 50_000m);
        cart.Clear();
        Assert.Empty(cart.Items);
        Assert.Equal(0m, cart.Total);
    }
}
