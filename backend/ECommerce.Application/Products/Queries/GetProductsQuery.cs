using ECommerce.Application.Products.DTOs;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;

namespace ECommerce.Application.Products.Queries;

public record GetProductsQuery(
    string? Name, string? Description, string? Code,
    ProductSize? Size, ProductColor? Color) : IRequest<IEnumerable<ProductDto>>;

public record GetProductByIdQuery(Guid Id) : IRequest<ProductDto?>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _repo;
    public GetProductsQueryHandler(IProductRepository repo) => _repo = repo;

    public async Task<IEnumerable<ProductDto>> Handle(GetProductsQuery q, CancellationToken ct)
    {
        var products = await _repo.SearchAsync(q.Name, q.Description, q.Code, q.Size, q.Color, ct);
        return products.Select(p => new ProductDto(p.Id, p.Code, p.Name, p.Description,
            p.ImageUrl, p.Size, p.Color, p.Price, p.Stock, p.Stock > 0));
    }
}

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _repo;
    public GetProductByIdQueryHandler(IProductRepository repo) => _repo = repo;

    public async Task<ProductDto?> Handle(GetProductByIdQuery q, CancellationToken ct)
    {
        var p = await _repo.GetByIdAsync(q.Id, ct);
        return p is null ? null : new ProductDto(p.Id, p.Code, p.Name, p.Description,
            p.ImageUrl, p.Size, p.Color, p.Price, p.Stock, p.Stock > 0);
    }
}
