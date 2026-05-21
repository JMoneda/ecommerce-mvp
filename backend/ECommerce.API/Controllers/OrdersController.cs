using System.Security.Claims;
using ECommerce.Application.Orders.Commands;
using ECommerce.Application.Orders.Queries;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public OrdersController(IMediator mediator) => _mediator = mediator;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders()
    {
        var result = await _mediator.Send(new GetMyOrdersQuery(UserId));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var result = await _mediator.Send(new CheckoutCommand(UserId));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    // Admin endpoints
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] OrderStatus? status)
    {
        var result = await _mediator.Send(new GetAllOrdersQuery(status));
        return Ok(result);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest req)
    {
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, req.Status));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteOrderCommand(id));
        return result.IsSuccess ? NoContent() : NotFound(new { error = result.Error });
    }
}

public record UpdateStatusRequest(OrderStatus Status);
