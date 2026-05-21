using ECommerce.Application.Common;
using ECommerce.Application.Orders.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using MediatR;

namespace ECommerce.Application.Orders.Commands;

public record CheckoutCommand(Guid UserId) : IRequest<Result<OrderDto>>;
public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus Status) : IRequest<Result<OrderDto>>;
public record DeleteOrderCommand(Guid OrderId) : IRequest<Result<bool>>;

public class CheckoutCommandHandler : IRequestHandler<CheckoutCommand, Result<OrderDto>>
{
    private readonly ICartRepository _cartRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;
    private readonly IUnitOfWork _uow;

    public CheckoutCommandHandler(ICartRepository cartRepo, IOrderRepository orderRepo,
        IProductRepository productRepo, IUnitOfWork uow)
    { _cartRepo = cartRepo; _orderRepo = orderRepo; _productRepo = productRepo; _uow = uow; }

    public async Task<Result<OrderDto>> Handle(CheckoutCommand cmd, CancellationToken ct)
    {
        var cart = await _cartRepo.GetByUserIdAsync(cmd.UserId, ct);
        if (cart is null || !cart.Items.Any())
            return Result<OrderDto>.Failure("Cart is empty.");

        foreach (var item in cart.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct);
            if (product is null) return Result<OrderDto>.Failure($"Product {item.ProductId} not found.");
            if (!product.HasStock(item.Quantity))
                return Result<OrderDto>.Failure($"Insufficient stock for {product.Name}.");
            product.DecreaseStock(item.Quantity);
            _productRepo.Update(product);
        }

        var orderItems = cart.Items.Select(i => OrderItem.Create(i.ProductId, i.Quantity, i.UnitPrice)).ToList();
        var order = Order.Create(cmd.UserId, orderItems);
        await _orderRepo.AddAsync(order, ct);
        cart.Clear();
        _cartRepo.Update(cart);
        await _uow.SaveChangesAsync(ct);

        var items = order.Items.Select(i => new OrderItemDto(
            i.ProductId, cart.Items.FirstOrDefault(c => c.ProductId == i.ProductId)?.Product?.Name ?? "",
            i.Quantity, i.UnitPrice, i.Subtotal)).ToList();

        return Result<OrderDto>.Success(new OrderDto(order.Id, order.OrderNumber, order.Status,
            order.Total, order.CreatedAt, items, null));
    }
}

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result<OrderDto>>
{
    private readonly IOrderRepository _repo;
    private readonly IUnitOfWork _uow;
    public UpdateOrderStatusCommandHandler(IOrderRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<OrderDto>> Handle(UpdateOrderStatusCommand cmd, CancellationToken ct)
    {
        var order = await _repo.GetByIdAsync(cmd.OrderId, ct);
        if (order is null) return Result<OrderDto>.Failure("Order not found.");

        order.SetStatus(cmd.Status);
        _repo.Update(order);
        await _uow.SaveChangesAsync(ct);

        var items = order.Items.Select(i => new OrderItemDto(
            i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.Subtotal)).ToList();

        return Result<OrderDto>.Success(new OrderDto(order.Id, order.OrderNumber, order.Status,
            order.Total, order.CreatedAt, items, $"{order.User?.FirstName} {order.User?.LastName}"));
    }
}

public class DeleteOrderCommandHandler : IRequestHandler<DeleteOrderCommand, Result<bool>>
{
    private readonly IOrderRepository _repo;
    private readonly IUnitOfWork _uow;
    public DeleteOrderCommandHandler(IOrderRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<Result<bool>> Handle(DeleteOrderCommand cmd, CancellationToken ct)
    {
        var order = await _repo.GetByIdAsync(cmd.OrderId, ct);
        if (order is null) return Result<bool>.Failure("Order not found.");
        _repo.Delete(order);
        await _uow.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}
