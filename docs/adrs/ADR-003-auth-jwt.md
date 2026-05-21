# ADR-003: Estrategia de Autenticación — JWT + ASP.NET Core Identity

**Fecha:** 2026-05-21  
**Estado:** Aceptado

## Contexto

Se requiere autenticación con dos roles (Cliente y Administrador). El sistema debe ser extensible a múltiples proveedores de autenticación en el futuro (OAuth2, OpenID Connect, SSO corporativo).

## Opciones Consideradas

### Opción A: JWT stateless (elegida)
- **Pros:** Sin estado en servidor, escala horizontalmente, compatible con SPAs (Angular), estándar de industria.
- **Contras:** No se puede revocar un token sin infraestructura adicional (blacklist/refresh tokens).

### Opción B: Cookies de sesión
- **Pros:** Revocación sencilla, soporte nativo en navegadores.
- **Contras:** Requiere estado en servidor, problemas de CORS con SPAs, no natural para APIs REST.

### Opción C: OAuth2 / OpenID Connect externo (Keycloak, Auth0)
- **Pros:** Estándar, múltiples providers nativos, muy extensible.
- **Contras:** Complejidad de infraestructura excesiva para un MVP, tiempo de configuración elevado.

## Decisión

**JWT stateless con ASP.NET Core Identity** para la gestión de usuarios y roles.

- `ITokenService` en la capa Application define el contrato de generación de tokens.
- `TokenService` en Infrastructure implementa JWT con claims de rol.
- Los tokens expiran en 8 horas (suficiente para sesión de trabajo).

### Plan de extensibilidad a múltiples providers:
1. El frontend puede agregar botones de login social (Google, Microsoft).
2. El backend implementaría `GoogleAuthCommandHandler` que valida el id_token de Google y llama a `ITokenService` para emitir el JWT propio.
3. Esto sigue el mismo patrón Command/Handler sin modificar el flujo existente de login/registro.

## Consecuencias

- El frontend almacena el JWT en `localStorage` (decisión pragmática para MVP; en producción se recomienda httpOnly cookie).
- El interceptor Angular adjunta el Bearer token a todas las peticiones autenticadas.
- Los guards de Angular (`authGuard`, `adminGuard`, `guestGuard`) protegen rutas basándose en el estado del signal de usuario.

## Supuesto

Se asume que el MVP no requiere refresh tokens. El usuario debe volver a iniciar sesión tras 8 horas. En una versión productiva se agregaría un endpoint de refresh token.
