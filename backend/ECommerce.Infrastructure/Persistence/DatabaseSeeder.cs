using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext ctx,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        await ctx.Database.MigrateAsync();

        await SeedRolesAsync(roleManager);
        await SeedAdminAsync(userManager);
        await SeedProductsAsync(ctx);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        string[] roles = ["Admin", "Customer"];
        foreach (var role in roles)
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }

    private static async Task SeedAdminAsync(UserManager<ApplicationUser> userManager)
    {
        const string adminEmail = "admin@ecommerce.com";
        if (await userManager.FindByEmailAsync(adminEmail) is not null) return;

        var admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            FirstName = "Admin",
            LastName = "System",
            Age = 30,
            DateOfBirth = new DateTime(1995, 1, 1),
            Country = "Colombia",
            State = "Antioquia",
            City = "Medellín",
            Phone = "3001234567",
            Address = "Calle 1 # 1-1"
        };

        await userManager.CreateAsync(admin, "Admin123!");
        await userManager.AddToRoleAsync(admin, "Admin");
    }

    private static async Task SeedProductsAsync(AppDbContext ctx)
    {
        if (await ctx.Products.AnyAsync()) return;

        // El MVP no incluye imágenes reales de producto; se usa un placeholder
        // servido por el frontend (public/placeholder.svg). En producción
        // cada producto tendría su imagen en un CDN.
        const string img = "/placeholder.svg";
        var products = new List<Product>
        {
            Product.Create("TNS-001", "Nike Air Max 90", "Clásico diseño con unidad de aire visible.", img, ProductSize.Nine, ProductColor.White, 459900, 20),
            Product.Create("TNS-002", "Adidas Ultraboost 22", "Máxima amortiguación para largas distancias.", img, ProductSize.Eight, ProductColor.Black, 539900, 15),
            Product.Create("TNS-003", "Puma RS-X", "Diseño retro con suela gruesa y colores vibrantes.", img, ProductSize.Ten, ProductColor.Gray, 319900, 25),
            Product.Create("TNS-004", "New Balance 574", "Icónico tenis casual con suela de gamuza.", img, ProductSize.Seven, ProductColor.Gray, 289900, 18),
            Product.Create("TNS-005", "Nike React Infinity", "Diseñado para reducir el riesgo de lesiones.", img, ProductSize.Nine, ProductColor.Black, 489900, 12),
            Product.Create("TNS-006", "Adidas Stan Smith", "Clásico tenis de cuero para uso casual.", img, ProductSize.Eight, ProductColor.White, 249900, 30),
            Product.Create("TNS-007", "Reebok Club C 85", "Tenis vintage de cuero con estilo minimalista.", img, ProductSize.Seven, ProductColor.White, 219900, 22),
            Product.Create("TNS-008", "Nike Air Force 1", "El icónico tenis de baloncesto hecho casual.", img, ProductSize.Ten, ProductColor.White, 369900, 35),
            Product.Create("TNS-009", "Adidas NMD R1", "Tenis lifestyle con boost y barras decorativas.", img, ProductSize.Nine, ProductColor.Black, 429900, 10),
            Product.Create("TNS-010", "Puma Suede Classic", "Tenis de ante con historia desde 1968.", img, ProductSize.Eight, ProductColor.Gray, 199900, 28)
        };

        await ctx.Products.AddRangeAsync(products);
        await ctx.SaveChangesAsync();
    }
}
