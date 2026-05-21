using ECommerce.Application.Cart.DTOs;
using ECommerce.Application.Common;
using ECommerce.Domain.Interfaces;
using MediatR;

namespace ECommerce.Application.Cart.Commands;

public record AddToCartCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest<Result<CartDto>>;
public record RemoveFromCartCommand(Guid UserId, Guid ProductId) : IRequest<Result<CartDto>>;
public record UpdateCartItemCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest<Result<CartDto>>;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result<CartDto>>
{
    private readonly ICartRepository _cartRepo;
    private readonly IProductRepository _productRepo;
    private readonly IUnitOfWork _uow;

    public AddToCartCommandHandler(ICartRepository cartRepo, IProductRepository productRepo, IUnitOfWork uow)
    { _cartRepo = cartRepo; _productRepo = productRepo; _uow = uow; }

    public async Task<Result<CartDto>> Handle(AddToCartCommand cmd, CancellationToken ct)
    {
        var product = await _productRepo.GetByIdAsync(cmd.ProductId, ct);
        if (product is null) return Result<CartDto>.Failure("Product not found.");
        if (!product.HasStock(cmd.Quantity)) return Result<CartDto>.Failure("Insufficient stock.");

        var cart = await _cartRepo.GetByUserIdAsync(cmd.UserId, ct);
        if (cart is null)
        {
            // Carrito nuevo: se inserta el grafo completo.
            cart = Domain.Entities.Cart.Create(cmd.UserId);
            cart.AddItem(cmd.ProductId, cmd.Quantity, product.Price);
            await _cartRepo.AddAsync(cart, ct);
        }
        else
        {
            // Carrito existente: ya está rastreado por EF, basta con mutarlo.
            cart.AddItem(cmd.ProductId, cmd.Quantity, product.Price);
        }
        await _uow.SaveChangesAsync(ct);

        // Se relee para tener la navegación Product cargada en todos los ítems.
        var saved = await _cartRepo.GetByUserIdAsync(cmd.UserId, ct);
        return Result<CartDto>.Success(CartMapper.ToDto(saved!));
    }
}

public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, Result<CartDto>>
{
    private readonly ICartRepository _repo;
    private readonly IUnitOfWork _uow;
    public RemoveFromCartCommandHandler(ICartRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<CartDto>> Handle(RemoveFromCartCommand cmd, CancellationToken ct)
    {
        var cart = await _repo.GetByUserIdAsync(cmd.UserId, ct);
        if (cart is null) return Result<CartDto>.Failure("Cart not found.");

        cart.RemoveItem(cmd.ProductId);
        await _uow.SaveChangesAsync(ct);
        return Result<CartDto>.Success(CartMapper.ToDto(cart));
    }
}

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Result<CartDto>>
{
    private readonly ICartRepository _repo;
    private readonly IUnitOfWork _uow;
    public UpdateCartItemCommandHandler(ICartRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<CartDto>> Handle(UpdateCartItemCommand cmd, CancellationToken ct)
    {
        var cart = await _repo.GetByUserIdAsync(cmd.UserId, ct);
        if (cart is null) return Result<CartDto>.Failure("Cart not found.");

        cart.UpdateItemQuantity(cmd.ProductId, cmd.Quantity);
        await _uow.SaveChangesAsync(ct);
        return Result<CartDto>.Success(CartMapper.ToDto(cart));
    }
}

public static class CartMapper
{
    public static CartDto ToDto(Domain.Entities.Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemDto(
            i.Id, i.ProductId,
            i.Product?.Name ?? string.Empty,
            i.Product?.ImageUrl ?? string.Empty,
            i.Quantity, i.UnitPrice, i.Subtotal)).ToList();
        return new CartDto(cart.Id, items, cart.Total);
    }
}
