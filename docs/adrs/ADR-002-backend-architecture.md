# ADR-002: Arquitectura del Backend

**Fecha:** 2026-05-21  
**Estado:** Aceptado

## Contexto

El backend debe ser mantenible, testeable y extensible. La prueba requiere múltiples servicios (auth, productos, carrito, órdenes) y anticipa extensibilidad a múltiples métodos de pago y proveedores de autenticación.

## Opciones Consideradas

### Opción A: Arquitectura en capas tradicional (MVC)
- **Pros:** Simple, familiar, rápido de implementar.
- **Contras:** Acoplamiento alto entre capas, difícil de testear en aislamiento, no escala bien con complejidad de dominio.

### Opción B: Microservicios
- **Pros:** Escalabilidad independiente, despliegue independiente.
- **Contras:** Complejidad operacional excesiva para un MVP, overhead de comunicación entre servicios, no justificado para el tamaño del proyecto.

### Opción C: Clean Architecture + CQRS con MediatR (elegida)
- **Pros:**
  - Separación clara: Domain → Application → Infrastructure → API.
  - El dominio es independiente de frameworks (testeable puro).
  - CQRS separa lecturas de escrituras, cada caso de uso es un handler aislado.
  - MediatR desacopla controladores de lógica de negocio.
  - Extensible: agregar un nuevo proveedor de autenticación = nuevo handler, sin tocar código existente.
- **Contras:** Mayor estructura inicial, curva de aprendizaje para equipos pequeños.

## Decisión

**Clean Architecture con CQRS + MediatR** sobre una sola aplicación (monolito modular).

### Estructura de capas:
```
Domain       → Entities, Enums, Interfaces (sin dependencias externas)
Application  → Commands, Queries, DTOs, Handlers (depende de Domain)
Infrastructure → EF Core, Repositorios, JWT, Identity (depende de Domain + Application)
API          → Controllers, Middleware (depende de Application + Infrastructure)
```

### Extensibilidad para múltiples métodos de pago:
Se puede agregar una interfaz `IPaymentGateway` en Application, con implementaciones en Infrastructure (`CashOnDeliveryGateway`, `StripeGateway`, `MercadoPagoGateway`). El `CheckoutCommandHandler` llama a la abstracción; el método concreto se inyecta por DI sin cambiar el handler.

### Extensibilidad para múltiples proveedores de auth:
La interfaz `ITokenService` en Application permite agregar `GoogleTokenService`, `MicrosoftTokenService` o cualquier proveedor OAuth2/OIDC sin modificar los command handlers de autenticación.

## Consecuencias

- Cada feature (Auth, Products, Cart, Orders) vive en su propia carpeta en Application con Commands, Queries y DTOs.
- Los tests unitarios del dominio no requieren base de datos ni framework.
- Agregar un nuevo caso de uso = crear un Command/Query + Handler, sin tocar código existente (Open/Closed Principle).
- La capa API queda delgada: solo orquesta HTTP ↔ MediatR.
