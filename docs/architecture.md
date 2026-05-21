# Diagrama de Arquitectura General

Sistema E-Commerce MVP — Universidad EAFIT.

> Los diagramas usan sintaxis **Mermaid**, que GitHub renderiza nativamente. Para la sustentación se pueden exportar como imagen desde [mermaid.live](https://mermaid.live).

## 1. Arquitectura del Sistema (vista general)

```mermaid
flowchart TB
    subgraph Client["🖥️ Cliente — Navegador"]
        SPA["Angular 21 SPA<br/>(Standalone Components + Signals)"]
    end

    subgraph Frontend["Frontend — Angular"]
        direction TB
        Features["features/<br/>Auth · Catalog · ProductDetail<br/>Cart · Orders · Admin"]
        Core["core/<br/>Services · Guards · Interceptor · Models"]
        Features --> Core
    end

    subgraph Backend["Backend — .NET 10 (Clean Architecture)"]
        direction TB
        API["API Layer<br/>Controllers · ExceptionMiddleware · Swagger · JWT"]
        APP["Application Layer<br/>CQRS Commands/Queries · MediatR Handlers · DTOs"]
        DOM["Domain Layer<br/>Entities · Enums · Repository Interfaces"]
        INFRA["Infrastructure Layer<br/>EF Core · Repositories · Identity · TokenService"]

        API --> APP
        APP --> DOM
        INFRA --> DOM
        INFRA --> APP
        API -.->|DI wiring| INFRA
    end

    DB[("🗄️ SQLite<br/>ecommerce.db")]

    SPA --> Frontend
    Core -->|"HTTP REST + JWT Bearer"| API
    INFRA -->|"EF Core"| DB

    style Client fill:#e8f0fe
    style Frontend fill:#fce8e8
    style Backend fill:#e8f5e9
    style DB fill:#fff3cd
```

## 2. Clean Architecture — Regla de Dependencias

Las dependencias apuntan **siempre hacia el centro**. El `Domain` no conoce a nadie; las capas externas dependen de las internas.

```mermaid
flowchart LR
    API["API<br/>(Controllers)"] --> APP["Application<br/>(CQRS + MediatR)"]
    APP --> DOM["Domain<br/>(Entidades + Interfaces)"]
    INFRA["Infrastructure<br/>(EF Core + Identity)"] --> APP
    INFRA --> DOM
    API -.->|"solo composición<br/>(DI en Program.cs)"| INFRA

    style DOM fill:#e8f5e9
    style APP fill:#dcedc8
    style API fill:#fce8e8
    style INFRA fill:#e8f0fe
```

**Por qué importa:** el `Domain` y la lógica de negocio (`Application`) no dependen de Entity Framework, ASP.NET ni de ningún framework. Esto los hace testeables de forma aislada (ver `ECommerce.Tests`) y permite cambiar la base de datos o el proveedor de autenticación sin reescribir reglas de negocio.

## 3. Flujo de una Petición (ejemplo: agregar al carrito)

```mermaid
sequenceDiagram
    participant U as Usuario (Angular)
    participant I as AuthInterceptor
    participant C as CartController
    participant M as MediatR
    participant H as AddToCartCommandHandler
    participant R as Repositorios (EF Core)
    participant DB as SQLite

    U->>I: POST /api/cart/items { productId, quantity }
    I->>C: + Header Authorization: Bearer JWT
    C->>M: Send(AddToCartCommand)
    M->>H: Handle(command)
    H->>R: GetProductByIdAsync / GetCartByUserIdAsync
    R->>DB: SELECT
    H->>H: Valida stock · cart.AddItem()
    H->>R: SaveChangesAsync (Unit of Work)
    R->>DB: INSERT / UPDATE
    H-->>C: Result<CartDto>
    C-->>U: 200 OK { cart }
```

## 4. Componentes por Capa

| Capa | Proyecto / Carpeta | Responsabilidad |
|------|--------------------|-----------------|
| Presentación | `frontend/ecommerce-app` | SPA Angular: UI, estado reactivo, rutas, guards |
| API | `ECommerce.API` | Endpoints REST, autenticación JWT, Swagger, manejo global de errores |
| Application | `ECommerce.Application` | Casos de uso (CQRS), validación, orquestación, DTOs |
| Domain | `ECommerce.Domain` | Entidades, reglas de negocio, contratos (interfaces) |
| Infrastructure | `ECommerce.Infrastructure` | Persistencia (EF Core), Identity, generación de JWT |
| Datos | SQLite (`ecommerce.db`) | Almacenamiento relacional |
| Tests | `ECommerce.Tests` | Pruebas unitarias de Domain y Application |
