using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string ImageUrl { get; private set; } = string.Empty;
    public ProductSize Size { get; private set; }
    public ProductColor Color { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }

    private Product() { }

    public static Product Create(string code, string name, string description,
        string imageUrl, ProductSize size, ProductColor color, decimal price, int stock)
    {
        return new Product
        {
            Code = code,
            Name = name,
            Description = description,
            ImageUrl = imageUrl,
            Size = size,
            Color = color,
            Price = price,
            Stock = stock
        };
    }

    public void Update(string name, string description, string imageUrl,
        ProductSize size, ProductColor color, decimal price, int stock)
    {
        Name = name;
        Description = description;
        ImageUrl = imageUrl;
        Size = size;
        Color = color;
        Price = price;
        Stock = stock;
        SetUpdatedAt();
    }

    public bool HasStock(int quantity) => Stock >= quantity;

    public void DecreaseStock(int quantity)
    {
        if (!HasStock(quantity))
            throw new InvalidOperationException($"Insufficient stock for product {Code}.");
        Stock -= quantity;
        SetUpdatedAt();
    }

    public void IncreaseStock(int quantity)
    {
        Stock += quantity;
        SetUpdatedAt();
    }
}
