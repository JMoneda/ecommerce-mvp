using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _ctx;
    public ProductRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Products.FindAsync([id], ct);

    public async Task<Product?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await _ctx.Products.FirstOrDefaultAsync(p => p.Code == code, ct);

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct = default)
        => await _ctx.Products.ToListAsync(ct);

    public async Task<IEnumerable<Product>> SearchAsync(string? name, string? description,
        string? code, ProductSize? size, ProductColor? color, CancellationToken ct = default)
    {
        var query = _ctx.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(p => p.Name.Contains(name));
        if (!string.IsNullOrWhiteSpace(description))
            query = query.Where(p => p.Description.Contains(description));
        if (!string.IsNullOrWhiteSpace(code))
            query = query.Where(p => p.Code.Contains(code));
        if (size.HasValue)
            query = query.Where(p => p.Size == size.Value);
        if (color.HasValue)
            query = query.Where(p => p.Color == color.Value);

        return await query.ToListAsync(ct);
    }

    public async Task AddAsync(Product product, CancellationToken ct = default)
        => await _ctx.Products.AddAsync(product, ct);

    public void Update(Product product) => _ctx.Products.Update(product);

    public void Delete(Product product) => _ctx.Products.Remove(product);

    public async Task<bool> CodeExistsAsync(string code, CancellationToken ct = default)
        => await _ctx.Products.AnyAsync(p => p.Code == code, ct);
}
