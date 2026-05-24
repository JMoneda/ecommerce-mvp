# E-Commerce MVP — Tenis Deportivos

Sistema de e-commerce para venta de tenis deportivos. Desarrollado como prueba técnica para Universidad EAFIT — Proceso de selección Desarrollador/a Senior 2026.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | .NET 10, ASP.NET Core, Clean Architecture + CQRS |
| ORM | Entity Framework Core 10 + SQLite |
| Auth | ASP.NET Core Identity + JWT |
| Logging | Serilog (Console + File rotado por día) |
| Frontend | Angular 21 (standalone components, signals) |
| Tests | xUnit + Moq (backend), Vitest + Angular Testing (frontend) |

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
- **Clean Architecture**: separación estricta por capas con dependencias unidireccionales (Domain ← Application ← Infrastructure / API)
- **CQRS + MediatR**: cada caso de uso es un Command/Query + Handler aislado
- **Repository Pattern + Unit of Work**: abstracción de persistencia
- **Factory Method**: entidades con constructores privados y métodos estáticos `Create()` que enforce invariantes
- **Result Pattern**: errores de negocio esperados se devuelven como `Result<T>`, no como excepciones
- **Global Exception Middleware**: manejo centralizado de errores con TraceId para soporte
- **Serilog logging estructurado**: sinks Console + File rotado por día, configuración declarativa en `appsettings.json`
- **Conventional Commits**: historial de Git semántico
- **SOLID**: los 5 principios mapeados archivo:línea en [docs/design-decisions.md](docs/design-decisions.md)

### Frontend
- **Standalone Components**: sin NgModules, más simple y tree-shakable
- **Templates y estilos separados** (`.html` + `.scss` + `.ts`): componentes mantenibles, no monolitos
- **Design Tokens**: sistema de variables CSS centralizado en [styles.scss](frontend/ecommerce-app/src/styles.scss) (colores, spacing, radius, tipografía)
- **Signals + Observables**: estado reactivo síncrono + HTTP async
- **Reactive Forms exclusivos**: cero `ngModel`; `FormBuilder`, `FormGroup`, `FormRecord` con validaciones
- **Lazy Loading**: cada feature se carga bajo demanda con `loadComponent`
- **Functional Guards e Interceptors**: patrón moderno de Angular 20+
- **Responsive mobile-first**: breakpoints consistentes (880/720/520px)
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
| [Decisiones de diseño](docs/design-decisions.md) | **SOLID y patrones mapeados archivo:línea** — para sustentación |
| [Diagrama de arquitectura](docs/architecture.md) | Vista general del sistema, capas y flujo de peticiones |
| [Modelo entidad-relación](docs/entity-relationship.md) | Diagrama ER, tablas, PK/FK y decisiones de modelado |
| [Colección Postman](docs/ECommerce.postman_collection.json) | Pruebas de la API (importar en Postman) |

### Architecture Decision Records

- [ADR-001: Manejo del carrito](docs/adrs/ADR-001-cart-state.md)
- [ADR-002: Arquitectura del backend](docs/adrs/ADR-002-backend-architecture.md)
- [ADR-003: Estrategia de autenticación](docs/adrs/ADR-003-auth-jwt.md)
- [ADR-004: Logging estructurado con Serilog](docs/adrs/ADR-004-logging.md)

### Uso de la colección Postman

1. Importar `docs/ECommerce.postman_collection.json` en Postman.
2. Ejecutar **Auth → Login (Admin)**: el token JWT se guarda automáticamente en la variable `token`.
3. El resto de peticiones usan ese token vía autenticación Bearer heredada de la colección.
4. **Get All Products** guarda automáticamente un `productId` para usar en Cart y Products.
