using ECommerce.Application.Common;
using ECommerce.Application.Products.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;

namespace ECommerce.Application.Products.Commands;

public record CreateProductCommand(
    string Code, string Name, string Description, string ImageUrl,
    ProductSize Size, ProductColor Color, decimal Price, int Stock) : IRequest<Result<ProductDto>>;

public record UpdateProductCommand(
    Guid Id, string Name, string Description, string ImageUrl,
    ProductSize Size, ProductColor Color, decimal Price, int Stock) : IRequest<Result<ProductDto>>;

public record DeleteProductCommand(Guid Id) : IRequest<Result<bool>>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _repo;
    private readonly IUnitOfWork _uow;
    public CreateProductCommandHandler(IProductRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand cmd, CancellationToken ct)
    {
        if (await _repo.CodeExistsAsync(cmd.Code, ct))
            return Result<ProductDto>.Failure($"Product code '{cmd.Code}' already exists.");

        var product = Product.Create(cmd.Code, cmd.Name, cmd.Description, cmd.ImageUrl, cmd.Size, cmd.Color, cmd.Price, cmd.Stock);
        await _repo.AddAsync(product, ct);
        await _uow.SaveChangesAsync(ct);

        return Result<ProductDto>.Success(new ProductDto(product.Id, product.Code, product.Name,
            product.Description, product.ImageUrl, (int)product.Size, product.Color, product.Price, product.Stock, product.Stock > 0));
    }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _repo;
    private readonly IUnitOfWork _uow;
    public UpdateProductCommandHandler(IProductRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand cmd, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(cmd.Id, ct);
        if (product is null) return Result<ProductDto>.Failure("Product not found.");

        product.Update(cmd.Name, cmd.Description, cmd.ImageUrl, cmd.Size, cmd.Color, cmd.Price, cmd.Stock);
        _repo.Update(product);
        await _uow.SaveChangesAsync(ct);

        return Result<ProductDto>.Success(new ProductDto(product.Id, product.Code, product.Name,
            product.Description, product.ImageUrl, (int)product.Size, product.Color, product.Price, product.Stock, product.Stock > 0));
    }
}

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<bool>>
{
    private readonly IProductRepository _repo;
    private readonly IUnitOfWork _uow;
    public DeleteProductCommandHandler(IProductRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<bool>> Handle(DeleteProductCommand cmd, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(cmd.Id, ct);
        if (product is null) return Result<bool>.Failure("Product not found.");

        _repo.Delete(product);
        await _uow.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}
