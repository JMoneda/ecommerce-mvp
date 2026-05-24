# Decisiones de Diseño — SOLID, Clean Architecture, Patrones

Documento que mapea cada principio de diseño, regla de Clean Architecture y patrón a su implementación concreta en el código, con archivo y línea. El objetivo es que cualquier lector pueda verificar la afirmación abriendo el archivo correspondiente.

---

## 1. Clean Architecture

### 1.1 Regla de dependencias

Las dependencias apuntan **siempre hacia el centro**: capas externas dependen de capas internas, nunca al revés. Esto permite que el `Domain` y la `Application` no sepan nada de Entity Framework, ASP.NET ni de ningún framework — son testeables en aislamiento.

```
API ─────► Application ─────► Domain
                              ▲
Infrastructure ───────────────┘
       └──► Application (implementa abstracciones)
```

**Evidencia:**

| Capa | Proyecto | Dependencias permitidas |
|------|----------|-------------------------|
| Domain | `backend/ECommerce.Domain/` | Ninguna (puro C#) |
| Application | `backend/ECommerce.Application/` | Solo Domain + MediatR |
| Infrastructure | `backend/ECommerce.Infrastructure/` | Domain + Application + EF Core + Identity |
| API | `backend/ECommerce.API/` | Application + Infrastructure (solo composición) |

Las referencias de proyecto se ven en cada `.csproj` — por ejemplo [ECommerce.API.csproj:18-21](../backend/ECommerce.API/ECommerce.API.csproj#L18-L21) sólo referencia Application e Infrastructure; nunca al revés.

### 1.2 El Domain no conoce frameworks

[Product.cs](../backend/ECommerce.Domain/Entities/Product.cs), [Cart.cs](../backend/ECommerce.Domain/Entities/Cart.cs), [Order.cs](../backend/ECommerce.Domain/Entities/Order.cs) son clases POCO con métodos de negocio y sin atributos de EF Core, sin anotaciones de ASP.NET. El mapeo a base de datos vive en otra capa: [ProductConfiguration.cs](../backend/ECommerce.Infrastructure/Persistence/Configurations/ProductConfiguration.cs).

**Por qué importa:** podemos cambiar de EF Core a Dapper, de SQLite a PostgreSQL, o testear el dominio sin levantar ninguna base de datos. Los tests en [CartTests.cs](../backend/ECommerce.Tests/Domain/CartTests.cs) lo demuestran — son puro `new Cart()` sin mocks.

### 1.3 Abstracciones definidas donde se usan

Las interfaces de repositorios viven en `Domain` ([IProductRepository.cs](../backend/ECommerce.Domain/Interfaces/IProductRepository.cs), [ICartRepository.cs](../backend/ECommerce.Domain/Interfaces/ICartRepository.cs), [IOrderRepository.cs](../backend/ECommerce.Domain/Interfaces/IOrderRepository.cs), [IUnitOfWork.cs](../backend/ECommerce.Domain/Interfaces/IUnitOfWork.cs)).

Las implementaciones viven en `Infrastructure` ([ProductRepository.cs](../backend/ECommerce.Infrastructure/Persistence/Repositories/ProductRepository.cs), etc.).

**Por qué importa:** esto es el **Dependency Inversion Principle** llevado al límite. La capa que define el contrato (Domain) no depende de quien lo implementa (Infrastructure). El cableado se hace en [Infrastructure/DependencyInjection.cs:34-38](../backend/ECommerce.Infrastructure/DependencyInjection.cs#L34-L38).

---

## 2. Principios SOLID

### S — Single Responsibility Principle

Cada **handler** de MediatR tiene un único caso de uso. No hay un `CartService` con 10 métodos: hay 3 handlers, uno por operación.

| Caso de uso | Handler | Responsabilidad única |
|---|---|---|
| Agregar al carrito | [AddToCartCommandHandler](../backend/ECommerce.Application/Cart/Commands/CartCommands.cs#L12-L46) | Validar stock, agregar item, persistir |
| Eliminar del carrito | [RemoveFromCartCommandHandler](../backend/ECommerce.Application/Cart/Commands/CartCommands.cs#L48-L63) | Quitar item, persistir |
| Actualizar cantidad | [UpdateCartItemCommandHandler](../backend/ECommerce.Application/Cart/Commands/CartCommands.cs#L65-L80) | Cambiar cantidad, persistir |
| Hacer checkout | [CheckoutCommandHandler](../backend/ECommerce.Application/Orders/Commands/OrderCommands.cs) | Crear orden desde carrito |

Si mañana hay que cambiar la lógica de "agregar al carrito" (por ejemplo, reservar stock temporalmente), se toca **un solo archivo**.

### O — Open/Closed Principle

El sistema está **abierto a extensión** (agregar nuevos casos de uso) y **cerrado a modificación** (no hay que tocar código existente).

Ejemplo concreto: para agregar el caso de uso "marcar producto como favorito":

1. Crear `AddFavoriteCommand` + handler en `Application/Favorites/`.
2. Crear endpoint en un nuevo `FavoritesController`.
3. **Cero cambios** en código existente. MediatR descubre el handler automáticamente vía [Application/DependencyInjection.cs:9](../backend/ECommerce.Application/DependencyInjection.cs#L9) que escanea el assembly.

### L — Liskov Substitution Principle

Las implementaciones de `IProductRepository`, `ICartRepository`, etc. son intercambiables sin romper el código que las usa. Esto se prueba en [GetProductsQueryHandlerTests.cs:13-31](../backend/ECommerce.Tests/Application/GetProductsQueryHandlerTests.cs#L13-L31): el handler trabaja con un `Mock<IProductRepository>` exactamente igual que trabajaría con `ProductRepository`.

### I — Interface Segregation Principle

No hay una "interfaz Dios". Cada repositorio expone solo lo que su agregado necesita:

- [IProductRepository](../backend/ECommerce.Domain/Interfaces/IProductRepository.cs): `GetByIdAsync`, `SearchAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync`.
- [ICartRepository](../backend/ECommerce.Domain/Interfaces/ICartRepository.cs): `GetByUserIdAsync`, `AddAsync` (no necesita Delete porque la regla de negocio es "limpiar el carrito", no borrarlo).
- [IOrderRepository](../backend/ECommerce.Domain/Interfaces/IOrderRepository.cs): operaciones específicas de órdenes.

Si un handler solo necesita leer productos, no carga una interfaz con métodos de escritura.

### D — Dependency Inversion Principle

Los handlers dependen de **abstracciones** (`IProductRepository`, `ITokenService`, `IUnitOfWork`), no de implementaciones concretas. Ver [LoginCommandHandler](../backend/ECommerce.Application/Auth/Commands/LoginCommand.cs) — recibe `UserManager<ApplicationUser>` (abstracción de Identity) y `ITokenService` (nuestra abstracción).

La implementación de `ITokenService` vive en Infrastructure ([TokenService.cs](../backend/ECommerce.Infrastructure/Services/TokenService.cs)) y es ahí donde está la dependencia a JWT. Si mañana cambiamos de JWT a PASETO, solo se toca esa clase.

---

## 3. Patrones de Diseño

### 3.1 Mediator

**Implementación:** MediatR como bus de mensajes interno.

**Dónde:**
- Registro: [Application/DependencyInjection.cs:9](../backend/ECommerce.Application/DependencyInjection.cs#L9)
- Uso en controllers: `_mediator.Send(command)` en cada Controller — ver [CartController.cs:24,31,38,45](../backend/ECommerce.API/Controllers/CartController.cs#L24)

**Por qué:** los controllers no conocen los handlers. Solo construyen el Command/Query y lo envían al mediador. Esto **desacopla totalmente** la capa HTTP de la lógica de negocio.

### 3.2 Command (CQRS — Commands)

**Implementación:** cada operación de escritura es un `record` que implementa `IRequest<TResponse>`.

**Ejemplos:**
- [RegisterCommand.cs:10-13](../backend/ECommerce.Application/Auth/Commands/RegisterCommand.cs#L10-L13)
- [CartCommands.cs:8-10](../backend/ECommerce.Application/Cart/Commands/CartCommands.cs#L8-L10) (3 commands: Add, Remove, Update)
- [OrderCommands.cs](../backend/ECommerce.Application/Orders/Commands/OrderCommands.cs) (Checkout, UpdateStatus, Delete)
- [ProductCommands.cs](../backend/ECommerce.Application/Products/Commands/ProductCommands.cs) (Create, Update, Delete)

**Por qué:** un Command es un objeto inmutable que describe **una intención de cambio**. Es testeable, serializable, fácil de loguear (audit log).

### 3.3 Query (CQRS — Queries)

**Implementación:** cada operación de lectura es un `record` separado, sin compartir modelos con Commands.

**Ejemplos:**
- [GetProductsQuery](../backend/ECommerce.Application/Products/Queries/GetProductsQuery.cs)
- [GetCartQuery](../backend/ECommerce.Application/Cart/Queries/GetCartQuery.cs)
- [GetOrdersQuery](../backend/ECommerce.Application/Orders/Queries/GetOrdersQuery.cs)

**Por qué:** separar lecturas de escrituras (CQRS) permite optimizar cada lado por separado. Hoy ambos usan EF Core; mañana las queries podrían ir a una réplica de solo-lectura sin tocar los Commands.

### 3.4 Repository

**Implementación:** abstracción sobre EF Core para que el dominio no dependa del ORM.

**Interfaces:** [IProductRepository](../backend/ECommerce.Domain/Interfaces/IProductRepository.cs), [ICartRepository](../backend/ECommerce.Domain/Interfaces/ICartRepository.cs), [IOrderRepository](../backend/ECommerce.Domain/Interfaces/IOrderRepository.cs)

**Implementaciones:** [ProductRepository.cs](../backend/ECommerce.Infrastructure/Persistence/Repositories/ProductRepository.cs), [CartRepository.cs](../backend/ECommerce.Infrastructure/Persistence/Repositories/CartRepository.cs), [OrderRepository.cs](../backend/ECommerce.Infrastructure/Persistence/Repositories/OrderRepository.cs)

### 3.5 Unit of Work

**Implementación:** [IUnitOfWork.cs](../backend/ECommerce.Domain/Interfaces/IUnitOfWork.cs) con un único método `SaveChangesAsync()`. La implementación es el propio `AppDbContext`, registrado como `IUnitOfWork` en [Infrastructure/DependencyInjection.cs:34](../backend/ECommerce.Infrastructure/DependencyInjection.cs#L34).

**Por qué:** los handlers hacen múltiples mutaciones (ej: descontar stock + crear orden + limpiar carrito en checkout) y persisten todo en **una sola transacción** llamando `_uow.SaveChangesAsync()`. Ver [CheckoutCommandHandler en OrderCommands.cs](../backend/ECommerce.Application/Orders/Commands/OrderCommands.cs).

### 3.6 Factory Method

**Implementación:** las entidades del dominio tienen constructor privado y un método estático `Create()` que enforce invariantes.

**Ejemplos:**
- [Product.Create](../backend/ECommerce.Domain/Entities/Product.cs#L19-L33) — crea un Product con todos sus campos requeridos.
- [Cart.Create](../backend/ECommerce.Domain/Entities/Cart.cs#L13) — `Cart.Create(userId)`.
- [Order.Create](../backend/ECommerce.Domain/Entities/Order.cs#L17-L27) — genera el `OrderNumber` con formato `ORD-YYYYMMDD-XXXXXXXX`.

**Por qué:** evita que se construyan entidades en estado inválido. No se puede hacer `new Product()` desde fuera porque el constructor es privado.

### 3.7 Result Pattern

**Implementación:** [Result.cs](../backend/ECommerce.Application/Common/Result.cs) — wrapper que representa éxito o fallo con mensaje.

**Por qué:** los handlers no lanzan excepciones para errores de negocio esperados (stock insuficiente, producto no encontrado). Devuelven `Result<T>` que el controller mapea a `Ok`/`BadRequest`. Las excepciones quedan solo para errores **inesperados** (DB caída, bug), capturados por [ExceptionMiddleware](../backend/ECommerce.API/Middleware/ExceptionMiddleware.cs).

Ejemplo: [AddToCartCommandHandler:24-25](../backend/ECommerce.Application/Cart/Commands/CartCommands.cs#L24-L25):
```csharp
if (product is null) return Result<CartDto>.Failure("Product not found.");
if (!product.HasStock(cmd.Quantity)) return Result<CartDto>.Failure("Insufficient stock.");
```

### 3.8 Decorator / Middleware Pipeline (ASP.NET)

**Implementación:** [ExceptionMiddleware.cs](../backend/ECommerce.API/Middleware/ExceptionMiddleware.cs) envuelve toda request para capturar excepciones no manejadas. Registrado en [Program.cs:78](../backend/ECommerce.API/Program.cs#L78).

`UseSerilogRequestLogging()` en [Program.cs:75](../backend/ECommerce.API/Program.cs#L75) es otro middleware que añade logging estructurado a cada request.

### 3.9 Strategy (preparado para extensión)

El sistema está preparado para añadir múltiples estrategias de pago y autenticación sin tocar handlers existentes.

**Para pagos:** `IPaymentGateway` (a crear) con implementaciones `CashOnDeliveryGateway`, `StripeGateway`, `MercadoPagoGateway`. Ver detalle en [ADR-002:41-45](adrs/ADR-002-backend-architecture.md#L41-L45).

**Para auth:** `ITokenService` ya existe. Para añadir Google OAuth basta con crear `GoogleAuthCommandHandler` que valide el id_token y llame al mismo `ITokenService`. Ver [ADR-003:32-35](adrs/ADR-003-auth-jwt.md#L32-L35).

---

## 4. Frontend — Clean Code

### 4.1 Separación de responsabilidades en componentes Angular

Cada componente tiene **3 archivos**: `.ts` (lógica), `.html` (template), `.scss` (estilos). Esto reemplaza el patrón anterior de "todo inline" que dificultaba la mantenibilidad.

**Ejemplos:**
- [catalog.component.ts](../frontend/ecommerce-app/src/app/features/catalog/catalog.component.ts) (95 líneas, solo lógica)
- [catalog.component.html](../frontend/ecommerce-app/src/app/features/catalog/catalog.component.html) (97 líneas, solo template)
- [catalog.component.scss](../frontend/ecommerce-app/src/app/features/catalog/catalog.component.scss) (140 líneas, solo estilos)

**Por qué:** un `.ts` que mezcla lógica + template + estilos crece a 300+ líneas y se vuelve difícil de revisar. Tres archivos pequeños son más navegables y permiten cambios paralelos (uno toca lógica, otro estilos, sin conflictos).

### 4.2 Sistema de Design Tokens

Todo el estilo visual se construye sobre **CSS Custom Properties** centralizadas en [styles.scss](../frontend/ecommerce-app/src/styles.scss):

- Colores (`--c-bg`, `--c-accent`, `--c-ink`…)
- Espaciado en escala de 4px (`--s-1` a `--s-9`)
- Radios (`--r-sm`, `--r-md`, `--r-lg`, `--r-pill`)
- Sombras (`--sh-1` a `--sh-3`)
- Tipografía (`--f-display`, `--f-body`)

**Por qué:** cambiar el color de marca = editar una variable. Los componentes nunca hardcodean colores ni paddings.

### 4.3 Functional Guards e Interceptors

[auth.guard.ts](../frontend/ecommerce-app/src/app/core/guards/auth.guard.ts) y [auth.interceptor.ts](../frontend/ecommerce-app/src/app/core/interceptors/auth.interceptor.ts) son **funciones puras**, no clases con DI manual. Es el patrón moderno de Angular 20+ que reemplaza al viejo `CanActivate` class-based.

### 4.4 Estado reactivo con Signals + Observables

Cada `service` mantiene estado con `signal()` (síncrono, granular) y expone Observables para operaciones HTTP. Ver [CartService:10-14](../frontend/ecommerce-app/src/app/core/services/cart.service.ts#L10-L14):

```typescript
private _cart = signal<Cart | null>(null);
readonly cart = this._cart.asReadonly();
readonly itemCount = computed(() => this._cart()?.items.reduce(...) ?? 0);
readonly total = computed(() => this._cart()?.total ?? 0);
```

El componente solo consume signals; el servicio absorbe la complejidad async.

### 4.5 Formularios exclusivamente reactivos

Cero `[(ngModel)]`. Todos los formularios usan `FormBuilder`/`FormGroup`/`FormControl` con validadores explícitos. Ver [register.component.ts:20-33](../frontend/ecommerce-app/src/app/features/auth/register/register.component.ts#L20-L33).

Casos avanzados:
- [catalog.component.ts:44](../frontend/ecommerce-app/src/app/features/catalog/catalog.component.ts#L44) — `FormRecord<FormControl<number>>` para tener un control por producto en la grid.
- [admin-orders.component.ts:31](../frontend/ecommerce-app/src/app/features/admin/orders/admin-orders.component.ts#L31) — `FormRecord<FormControl<OrderStatus>>` para cambiar estado por fila.

### 4.6 Lazy Loading

Cada feature se carga **bajo demanda** con `loadComponent`. Ver [app.routes.ts:10-32](../frontend/ecommerce-app/src/app/app.routes.ts#L10-L32). Resultado: el bundle inicial solo carga catálogo (no admin, no carrito, no auth).

### 4.7 Responsive mobile-first con breakpoints consistentes

Tres breakpoints reutilizados en todos los componentes:

| Breakpoint | Uso |
|---|---|
| `880px` | Tablet → mobile (layouts de 2-3 columnas colapsan a 1) |
| `720px` | Mobile estándar (tablas pierden columnas decorativas) |
| `520px` | Mobile pequeño (filtros van a stack vertical) |

Las tablas de admin usan `overflow-x: auto` para scroll horizontal en pantallas estrechas en vez de romper el layout.

---

## 5. Trazabilidad de requisitos NO funcionales

| Requisito | Implementación | Evidencia |
|---|---|---|
| SOLID | 5 principios aplicados en backend | Sección 2 de este documento |
| Clean Architecture | 4 capas con dependencias unidireccionales | Sección 1, [architecture.md](architecture.md) |
| Patrones de diseño | Mediator, Command, Query, Repository, UoW, Factory, Result, Strategy | Sección 3 |
| Mediator pattern | MediatR como bus interno | [DependencyInjection.cs:9](../backend/ECommerce.Application/DependencyInjection.cs#L9) |
| Conventional Commits | Historial git | `git log` |
| Supuestos documentados | 8 supuestos | [README.md:111-120](../README.md#L111-L120) |
| Frontend Clean Code | Templates/estilos separados, design tokens | Sección 4 |
| Reactive Forms exclusivo | `ReactiveFormsModule` en todos los forms | Cero ocurrencias de `ngModel` en formularios |
| Signals + Observables | Estado con signal, HTTP con Observable | Sección 4.4 |
| Responsive | 3 breakpoints consistentes | Sección 4.7 |
| Error handling backend | Middleware global + Result pattern | [ExceptionMiddleware.cs](../backend/ECommerce.API/Middleware/ExceptionMiddleware.cs), [Result.cs](../backend/ECommerce.Application/Common/Result.cs) |
| Error handling frontend | `errorMsg` signal + interceptor + traducción de errores | [auth-errors.ts](../frontend/ecommerce-app/src/app/core/utils/auth-errors.ts) |
| EF Core | ORM principal | [DependencyInjection.cs:18-19](../backend/ECommerce.Infrastructure/DependencyInjection.cs#L18-L19) |
| Swagger | Documentación API | [Program.cs:23-41](../backend/ECommerce.API/Program.cs#L23-L41) |
| Tests unitarios backend | 14 tests xUnit + Moq | [ECommerce.Tests/](../backend/ECommerce.Tests/) |
| Test de componente frontend | 5 tests del catálogo + 2 del App shell | [catalog.component.spec.ts](../frontend/ecommerce-app/src/app/features/catalog/catalog.component.spec.ts) |
| Logging estructurado | Serilog con sink de archivo rotado | Ver [ADR-004](adrs/ADR-004-logging.md) |
| Modelo ER | Diagrama Mermaid + tabla PK/FK | [entity-relationship.md](entity-relationship.md) |
| Extensibilidad pagos/auth | Strategy + ITokenService | [ADR-002:41-45](adrs/ADR-002-backend-architecture.md#L41-L45), [ADR-003:32-35](adrs/ADR-003-auth-jwt.md#L32-L35) |
