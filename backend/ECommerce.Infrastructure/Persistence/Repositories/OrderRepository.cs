using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _ctx;
    public OrderRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Order>> GetAllAsync(OrderStatus? status = null, CancellationToken ct = default)
    {
        var query = _ctx.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.User)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync(ct);
    }

    public async Task AddAsync(Order order, CancellationToken ct = default)
        => await _ctx.Orders.AddAsync(order, ct);

    public void Update(Order order) => _ctx.Orders.Update(order);

    public void Delete(Order order) => _ctx.Orders.Remove(order);
}
