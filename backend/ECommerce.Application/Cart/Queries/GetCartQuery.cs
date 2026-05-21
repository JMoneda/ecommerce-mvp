using ECommerce.Application.Cart.DTOs;
using ECommerce.Domain.Interfaces;
using MediatR;

namespace ECommerce.Application.Cart.Queries;

public record GetCartQuery(Guid UserId) : IRequest<CartDto?>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto?>
{
    private readonly ICartRepository _repo;
    public GetCartQueryHandler(ICartRepository repo) => _repo = repo;

    public async Task<CartDto?> Handle(GetCartQuery q, CancellationToken ct)
    {
        var cart = await _repo.GetByUserIdAsync(q.UserId, ct);
        if (cart is null) return null;

        var items = cart.Items.Select(i => new CartItemDto(
            i.Id, i.ProductId, i.Product.Name, i.Product.ImageUrl,
            i.Quantity, i.UnitPrice, i.Subtotal)).ToList();

        return new CartDto(cart.Id, items, cart.Total);
    }
}
