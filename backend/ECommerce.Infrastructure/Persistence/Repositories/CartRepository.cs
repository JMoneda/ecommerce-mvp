using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _ctx;
    public CartRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId, ct);

    public async Task AddAsync(Cart cart, CancellationToken ct = default)
        => await _ctx.Carts.AddAsync(cart, ct);

    public void Update(Cart cart) => _ctx.Carts.Update(cart);
}
