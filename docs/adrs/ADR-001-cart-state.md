# ADR-001: Manejo del Estado del Carrito de Compras

**Fecha:** 2026-05-21  
**Estado:** Aceptado

## Contexto

El carrito de compras es una funcionalidad central del e-commerce. Se requería decidir dónde y cómo persistir su estado, considerando los requisitos de la plataforma: usuarios autenticados, pago contra entrega y necesidad de historial de órdenes.

## Opciones Consideradas

### Opción A: localStorage / sessionStorage
- **Pros:** Sin latencia de red, funciona sin autenticación, simple de implementar.
- **Contras:** No persiste entre dispositivos, se pierde al limpiar el navegador, no permite auditoría, inconsistencias si el stock cambia.

### Opción B: Estado en Frontend (Signals / NgRx)
- **Pros:** Reactivo, sin latencia, integración nativa con Angular.
- **Contras:** Volátil (se pierde al refrescar), no multidevice, no permite recuperar carrito abandonado.

### Opción C: Persistencia en Backend (elegida)
- **Pros:** Persiste entre sesiones y dispositivos, permite validar stock en tiempo real, facilita generación de órdenes, auditabilidad completa, base para funcionalidades futuras (carritos abandonados, analytics).
- **Contras:** Requiere autenticación previa, latencia de red en cada operación.

## Decisión

**Se elige persistencia en Backend** mediante una entidad `Cart` en base de datos, asociada al usuario autenticado.

El frontend usa **Angular Signals** (`signal<Cart>`) como caché reactiva local que se sincroniza con el backend. Esto combina la reactividad del frontend con la persistencia confiable del backend.

## Consecuencias

- El carrito requiere que el usuario esté autenticado (alineado con el flujo de pago contra entrega).
- El estado del signal se actualiza en cada operación (add, remove, update) con la respuesta del servidor.
- Se facilita la validación de stock en tiempo real al agregar productos.
- Extensible: se puede agregar TTL, abandono de carrito, y recuperación cross-device sin cambios de arquitectura.

## Supuestos

- Los usuarios anónimos no tienen carrito (la prueba no requiere guest checkout).
- El carrito se crea lazily la primera vez que el usuario agrega un producto.
