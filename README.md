# E-Commerce MVP — Tenis Deportivos

Sistema de e-commerce para venta de tenis deportivos. Desarrollado como prueba técnica para Universidad EAFIT — Proceso de selección Desarrollador/a Senior 2026.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | .NET 10, ASP.NET Core, Clean Architecture + CQRS |
| ORM | Entity Framework Core 10 + SQLite |
| Auth | ASP.NET Core Identity + JWT |
| Frontend | Angular 21 (standalone components, signals) |
| Tests | xUnit + Moq (backend), Angular Testing (frontend) |

## Requisitos Previos

- .NET 10 SDK
- Node.js 22+ y npm
- Angular CLI 21+: `npm install -g @angular/cli`
- dotnet-ef tool: `dotnet tool install --global dotnet-ef`

## Instalación y Ejecución

### Backend

```bash
cd backend

# Restaurar paquetes
dotnet restore ECommerce.slnx

# Ejecutar (aplica migraciones y seed automáticamente)
cd ECommerce.API
dotnet run
```

La API queda disponible en: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

**Usuario administrador por defecto:**
- Email: `admin@ecommerce.com`
- Password: `Admin123!`

### Frontend

```bash
cd frontend/ecommerce-app

npm install
ng serve
```

La aplicación queda disponible en: `http://localhost:4200`

### Tests Backend

```bash
cd backend
dotnet test ECommerce.Tests/ECommerce.Tests.csproj
```

### Tests Frontend

```bash
cd frontend/ecommerce-app
ng test --watch=false
```

## Arquitectura

```
ecommerce-mvp/
├── backend/
│   ├── ECommerce.Domain/          → Entidades, Enums, Interfaces (sin dependencias)
│   ├── ECommerce.Application/     → CQRS: Commands, Queries, Handlers, DTOs
│   ├── ECommerce.Infrastructure/  → EF Core, Repositorios, JWT, Identity
│   ├── ECommerce.API/             → Controllers, Middleware, Program.cs
│   └── ECommerce.Tests/           → Tests unitarios (xUnit + Moq)
├── frontend/
│   └── ecommerce-app/
│       └── src/app/
│           ├── core/              → Models, Services, Guards, Interceptors
│           ├── features/          → Auth, Catalog, Cart, Orders, Admin
│           └── shared/            → Navbar, componentes reutilizables
└── docs/
    └── adrs/                      → Architecture Decision Records
```

## Buenas Prácticas Aplicadas

### Backend
- **Clean Architecture**: separación estricta por capas con dependencias unidireccionales
- **CQRS + MediatR**: cada caso de uso es un Command/Query + Handler aislado
- **Repository Pattern + Unit of Work**: abstracción de persistencia
- **Factory Pattern**: entidades con constructores privados y métodos estáticos `Create()`
- **Guard Clauses**: validaciones al inicio de métodos de dominio
- **Global Exception Middleware**: manejo centralizado de errores
- **Conventional Commits**: historial de Git semántico
- **SOLID**: Single Responsibility en cada handler, Open/Closed para extensión de pagos/auth

### Frontend
- **Standalone Components**: sin NgModules, más simple y tree-shakable
- **Signals**: estado reactivo con `signal()` y `computed()` para auth y carrito
- **Reactive Forms**: todos los formularios usan `FormBuilder` + validaciones
- **Lazy Loading**: cada feature se carga bajo demanda con `loadComponent`
- **Functional Guards**: `authGuard`, `adminGuard`, `guestGuard` como funciones puras
- **HTTP Interceptor funcional**: adjunta JWT a cada request autenticada
- **Feature-based structure**: organización por dominio, no por tipo de archivo

## Supuestos y Consideraciones

1. **Pago contra entrega**: no se implementa pasarela de pagos. El flujo de checkout crea la orden directamente en estado `InProcess`.
2. **Imágenes de productos**: el seed usa rutas relativas (`/images/...`). En producción se usaría un CDN.
3. **localStorage para JWT**: pragmático para MVP. En producción se recomienda `httpOnly` cookie para prevenir XSS.
4. **Sin refresh tokens**: los tokens expiran en 8h. El usuario vuelve a autenticarse. Extensible sin cambios de arquitectura.
5. **SQLite**: elegido por facilidad de instalación local. En producción se migra a PostgreSQL/SQL Server cambiando solo el provider de EF Core.
6. **Un carrito por usuario**: si el usuario agrega el mismo producto dos veces, se incrementa la cantidad.
7. **Monorepo (backend + frontend en un solo repositorio)**: se eligió un único repositorio con ambos proyectos en lugar de repositorios separados. Para un MVP de un solo equipo, donde los cambios suelen tocar backend y frontend a la vez, esto permite commits atómicos full-stack, centraliza la documentación (ADRs, diagramas) y simplifica la revisión y el clonado. A escala de múltiples equipos o despliegues independientes por servicio se migraría a repositorios separados (polyrepo); para este alcance, el monorepo es la opción óptima.
8. **Login con email**: el requisito indica "login con usuario y contraseña". Se asume el email como identificador de usuario (es único y ya se solicita en el registro), evitando un campo `username` redundante.

## Extensibilidad

- **Nuevos métodos de pago**: implementar `IPaymentGateway` en Infrastructure e inyectarlo en `CheckoutCommandHandler`.
- **Nuevos proveedores de auth**: agregar un Command Handler que valide el token del proveedor y emita JWT propio vía `ITokenService`.
- **Base de datos diferente**: cambiar el provider de EF Core en `DependencyInjection.cs` sin tocar ninguna otra capa.

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [Diagrama de arquitectura](docs/architecture.md) | Vista general del sistema, capas y flujo de peticiones |
| [Modelo entidad-relación](docs/entity-relationship.md) | Diagrama ER, tablas, PK/FK y decisiones de modelado |
| [Colección Postman](docs/ECommerce.postman_collection.json) | Pruebas de la API (importar en Postman) |

### Architecture Decision Records

- [ADR-001: Manejo del carrito](docs/adrs/ADR-001-cart-state.md)
- [ADR-002: Arquitectura del backend](docs/adrs/ADR-002-backend-architecture.md)
- [ADR-003: Estrategia de autenticación](docs/adrs/ADR-003-auth-jwt.md)

### Uso de la colección Postman

1. Importar `docs/ECommerce.postman_collection.json` en Postman.
2. Ejecutar **Auth → Login (Admin)**: el token JWT se guarda automáticamente en la variable `token`.
3. El resto de peticiones usan ese token vía autenticación Bearer heredada de la colección.
4. **Get All Products** guarda automáticamente un `productId` para usar en Cart y Products.
