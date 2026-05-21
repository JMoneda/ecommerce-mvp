using ECommerce.Domain.Enums;

namespace ECommerce.Application.Products.DTOs;

public record ProductDto(
    Guid Id, string Code, string Name, string Description,
    string ImageUrl, ProductSize Size, ProductColor Color,
    decimal Price, int Stock, bool IsAvailable);

public record CreateProductRequest(
    string Code, string Name, string Description, string ImageUrl,
    ProductSize Size, ProductColor Color, decimal Price, int Stock);

public record UpdateProductRequest(
    string Name, string Description, string ImageUrl,
    ProductSize Size, ProductColor Color, decimal Price, int Stock);
