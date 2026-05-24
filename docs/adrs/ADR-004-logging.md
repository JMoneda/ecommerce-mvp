# ADR-004: Logging Estructurado y Persistente con Serilog

**Fecha:** 2026-05-24
**Estado:** Aceptado

## Contexto

La API expone operaciones críticas (autenticación, gestión de inventario, órdenes de compra con dinero involucrado). Para un sistema en producción —incluso un MVP— necesitamos poder:

1. **Diagnosticar problemas en producción** sin acceso al equipo donde corre el proceso.
2. **Auditar quién hizo qué y cuándo** (por ejemplo, qué admin cambió el estado de una orden).
3. **Correlacionar logs** entre múltiples requests para reproducir un flujo completo.
4. **Sobrevivir reinicios**: si el proceso muere y vuelve a arrancar, no perder lo que estaba en stdout.

El `ILogger` por defecto de ASP.NET solo escribe a consola, en formato texto, sin enrichers y sin persistencia. Es insuficiente.

## Opciones Consideradas

### Opción A: ILogger por defecto + redirección de stdout a archivo
- **Pros:** Cero dependencias nuevas.
- **Contras:** Formato no estructurado (no se puede consultar por propiedades), depende del orquestador (systemd, Docker) para persistir, no rota archivos, no enriquece con contexto.

### Opción B: NLog
- **Pros:** Maduro, configurable.
- **Contras:** Menos idiomático en el ecosistema moderno de .NET; sintaxis XML; menos adoptado que Serilog en proyectos nuevos.

### Opción C: Serilog (elegida)
- **Pros:**
  - **Logs estructurados nativos** (cada propiedad es indexable, se puede consultar por `OrderId=X`).
  - **Sinks** intercambiables (Console, File, Seq, Elasticsearch, Application Insights) sin tocar código de la app.
  - **Configuración declarativa** en `appsettings.json` — cambiar el nivel de log en producción sin recompilar.
  - **Rotación automática** del archivo por día con retención configurable.
  - **Enrichers** para añadir contexto (TraceId, MachineName, etc.) automáticamente.
  - Estándar de facto en .NET moderno; mínima fricción de adopción.
- **Contras:** Una dependencia más.

## Decisión

**Serilog con sinks `Console` + `File`**, configurado declarativamente desde [appsettings.json](../../backend/ECommerce.API/appsettings.json).

### Configuración

```json
"Serilog": {
  "MinimumLevel": {
    "Default": "Information",
    "Override": {
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "WriteTo": [
    { "Name": "Console", ... },
    { "Name": "File", "Args": {
        "path": "logs/ecommerce-.log",
        "rollingInterval": "Day",
        "retainedFileCountLimit": 14
    }}
  ],
  "Enrich": [ "FromLogContext" ]
}
```

### Integración

- [Program.cs:18-20](../../backend/ECommerce.API/Program.cs#L18-L20) — reemplaza el host logger por Serilog.
- [Program.cs:75](../../backend/ECommerce.API/Program.cs#L75) — `UseSerilogRequestLogging()` añade un log estructurado por cada HTTP request con duración, status, método y ruta.
- [ExceptionMiddleware.cs:21-25](../../backend/ECommerce.API/Middleware/ExceptionMiddleware.cs#L21-L25) — toda excepción no manejada se loguea con propiedades estructuradas (`ExceptionType`, `Method`, `Path`, `TraceId`).
- La respuesta de error incluye el `TraceId` para que el cliente lo reporte y podamos buscarlo directamente en los logs.

### Archivos generados

```
backend/ECommerce.API/logs/
├── ecommerce-20260524.log
├── ecommerce-20260525.log
└── ...   (hasta 14 días, los más viejos se eliminan)
```

Excluidos del repositorio en [.gitignore](../../.gitignore) (líneas `logs/` y `*.log`).

## Consecuencias

- **Positivas:**
  - Diagnóstico productivo sin acceso al servidor — basta `tail -f logs/ecommerce-*.log`.
  - Compatibilidad inmediata con observabilidad moderna: añadir Seq, Elasticsearch o Datadog = una línea en `appsettings.json`.
  - Logs sobreviven a reinicios del proceso.
  - Niveles por namespace evitan ruido (EF Core SQL queries en Warning, no Information).
  - El `TraceId` que devolvemos al cliente en errores 500 permite cerrar el ciclo de soporte rápido: "dame el TraceId" → `grep` en logs → contexto completo.

- **Negativas / Trade-offs:**
  - Espacio en disco: ~1-5 MB por día con tráfico moderado, 14 días = ~70 MB máximo. Aceptable.
  - Dependencia adicional. Mitigada porque Serilog es estable y mantenido por la Fundación .NET.

## Supuestos

- El proceso tiene permiso de escritura en `logs/` (relativo al working directory). Si en producción se ejecuta como servicio Windows o contenedor, el `path` se ajusta vía variable de entorno o configuración por entorno.
- Para producción de verdad, se reemplazaría el sink `File` por uno externo (Seq/Elasticsearch) para no depender del disco local.
