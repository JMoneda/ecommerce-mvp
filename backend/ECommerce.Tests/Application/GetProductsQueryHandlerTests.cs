using ECommerce.Application.Products.Queries;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Moq;

namespace ECommerce.Tests.Application;

public class GetProductsQueryHandlerTests
{
    private readonly Mock<IProductRepository> _repoMock = new();

    [Fact]
    public async Task Handle_ReturnsAllProducts_WhenNoFilters()
    {
        var products = new List<Product>
        {
            Product.Create("P001", "Shoe A", "Desc", "/img.jpg", ProductSize.Nine, ProductColor.White, 100_000m, 10),
            Product.Create("P002", "Shoe B", "Desc", "/img.jpg", ProductSize.Ten, ProductColor.Black, 200_000m, 0)
        };

        _repoMock.Setup(r => r.SearchAsync(null, null, null, null, null, default))
                 .ReturnsAsync(products);

        var handler = new GetProductsQueryHandler(_repoMock.Object);
        var result = (await handler.Handle(new GetProductsQuery(null, null, null, null, null), default)).ToList();

        Assert.Equal(2, result.Count);
        Assert.True(result[0].IsAvailable);
        Assert.False(result[1].IsAvailable);
    }

    [Fact]
    public async Task Handle_MapsIsAvailable_BasedOnStock()
    {
        var outOfStock = Product.Create("P003", "Shoe C", "Desc", "/img.jpg", ProductSize.Eight, ProductColor.Gray, 150_000m, 0);
        _repoMock.Setup(r => r.SearchAsync(null, null, null, null, null, default))
                 .ReturnsAsync(new List<Product> { outOfStock });

        var handler = new GetProductsQueryHandler(_repoMock.Object);
        var result = (await handler.Handle(new GetProductsQuery(null, null, null, null, null), default)).ToList();

        Assert.False(result.Single().IsAvailable);
    }
}
