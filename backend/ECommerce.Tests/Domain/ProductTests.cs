using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;

namespace ECommerce.Tests.Domain;

public class ProductTests
{
    private static Product CreateProduct(int stock = 10) =>
        Product.Create("TST-001", "Test Shoe", "Desc", "/img.jpg", ProductSize.Nine, ProductColor.White, 100_000m, stock);

    [Fact]
    public void Create_ShouldSetAllProperties()
    {
        var product = CreateProduct();
        Assert.Equal("TST-001", product.Code);
        Assert.Equal("Test Shoe", product.Name);
        Assert.Equal(100_000m, product.Price);
        Assert.Equal(10, product.Stock);
    }

    [Fact]
    public void HasStock_WhenSufficientStock_ReturnsTrue()
    {
        var product = CreateProduct(stock: 5);
        Assert.True(product.HasStock(5));
    }

    [Fact]
    public void HasStock_WhenInsufficientStock_ReturnsFalse()
    {
        var product = CreateProduct(stock: 3);
        Assert.False(product.HasStock(5));
    }

    [Fact]
    public void DecreaseStock_ShouldReduceStock()
    {
        var product = CreateProduct(stock: 10);
        product.DecreaseStock(3);
        Assert.Equal(7, product.Stock);
    }

    [Fact]
    public void DecreaseStock_WhenInsufficientStock_ThrowsException()
    {
        var product = CreateProduct(stock: 2);
        Assert.Throws<InvalidOperationException>(() => product.DecreaseStock(5));
    }

    [Fact]
    public void IncreaseStock_ShouldAddToStock()
    {
        var product = CreateProduct(stock: 10);
        product.IncreaseStock(5);
        Assert.Equal(15, product.Stock);
    }

    [Fact]
    public void Update_ShouldChangeProperties()
    {
        var product = CreateProduct();
        product.Update("New Name", "New Desc", "/new.jpg", ProductSize.Ten, ProductColor.Black, 200_000m, 20);
        Assert.Equal("New Name", product.Name);
        Assert.Equal(200_000m, product.Price);
        Assert.Equal(20, product.Stock);
    }
}
