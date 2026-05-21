using ECommerce.Application.Orders.DTOs;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;

namespace ECommerce.Application.Orders.Queries;

public record GetAllOrdersQuery(OrderStatus? Status) : IRequest<IEnumerable<OrderDto>>;
public record GetMyOrdersQuery(Guid UserId) : IRequest<IEnumerable<OrderDto>>;
public record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto?>;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IOrderRepository _repo;
    public GetAllOrdersQueryHandler(IOrderRepository repo) => _repo = repo;

    public async Task<IEnumerable<OrderDto>> Handle(GetAllOrdersQuery q, CancellationToken ct)
    {
        var orders = await _repo.GetAllAsync(q.Status, ct);
        return orders.Select(OrderMapper.ToDto);
    }
}

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, IEnumerable<OrderDto>>
{
    private readonly IOrderRepository _repo;
    public GetMyOrdersQueryHandler(IOrderRepository repo) => _repo = repo;

    public async Task<IEnumerable<OrderDto>> Handle(GetMyOrdersQuery q, CancellationToken ct)
    {
        var orders = await _repo.GetByUserIdAsync(q.UserId, ct);
        return orders.Select(OrderMapper.ToDto);
    }
}

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IOrderRepository _repo;
    public GetOrderByIdQueryHandler(IOrderRepository repo) => _repo = repo;

    public async Task<OrderDto?> Handle(GetOrderByIdQuery q, CancellationToken ct)
    {
        var o = await _repo.GetByIdAsync(q.OrderId, ct);
        return o is null ? null : OrderMapper.ToDto(o);
    }
}

public static class OrderMapper
{
    public static OrderDto ToDto(Domain.Entities.Order o) =>
        new(o.Id, o.OrderNumber, o.Status, o.Total, o.CreatedAt,
            o.Items.Select(i => new OrderItemDto(i.ProductId, i.Product?.Name ?? "", i.Quantity, i.UnitPrice, i.Subtotal)).ToList(),
            o.User is null ? null : $"{o.User.FirstName} {o.User.LastName}");
}
