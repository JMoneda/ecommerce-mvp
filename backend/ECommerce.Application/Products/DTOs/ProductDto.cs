using ECommerce.Domain.Enums;

namespace ECommerce.Application.Products.DTOs;

// Size se expone como int (7-10) para coincidir con el dominio del negocio;
// Color se mantiene como enum y se serializa como string (JsonStringEnumConverter).
public record ProductDto(
    Guid Id, string Code, string Name, string Description,
    string ImageUrl, int Size, ProductColor Color,
    decimal Price, int Stock, bool IsAvailable);

public record CreateProductRequest(
    string Code, string Name, string Description, string ImageUrl,
    ProductSize Size, ProductColor Color, decimal Price, int Stock);

public record UpdateProductRequest(
    string Name, string Description, string ImageUrl,
    ProductSize Size, ProductColor Color, decimal Price, int Stock);
