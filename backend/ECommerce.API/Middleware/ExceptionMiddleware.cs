using System.Net;
using System.Text.Json;

namespace ECommerce.API.Middleware;

/// <summary>
/// Captura toda excepción no manejada y la transforma en una respuesta JSON consistente.
/// Loguea con propiedades estructuradas (Path, Method, TraceId) para facilitar diagnóstico.
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    { _next = next; _logger = logger; }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unhandled exception {ExceptionType} on {Method} {Path} (TraceId={TraceId})",
                ex.GetType().Name, ctx.Request.Method, ctx.Request.Path, ctx.TraceIdentifier);

            await HandleExceptionAsync(ctx, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext ctx, Exception ex)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = ex switch
        {
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            _ => (int)HttpStatusCode.InternalServerError
        };

        var response = new
        {
            error = ex.Message,
            statusCode = ctx.Response.StatusCode,
            traceId = ctx.TraceIdentifier
        };
        return ctx.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
