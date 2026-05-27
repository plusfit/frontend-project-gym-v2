# Plan de Implementación Multi-tenant - Frontend (+FIT)

Este documento detalla los cambios necesarios en las aplicaciones Angular para soportar la jerarquía multitenant.

## 1. Gestión de Estado y Contexto (NGXS)
*   **TenantState**: Se creará un estado para almacenar la información de la Organización y Sucursal actual.
*   Al iniciar sesión, se poblará este estado desde la información contenida en el JWT decodificado.
*   **Persistencia**: La sucursal seleccionada se mantendrá en `localStorage` para evitar pérdidas al recargar.

## 2. Interfaz de Usuario Jerárquica

### Vistas por Rol:
1.  **SuperAdmin**:
    *   Dashboard global de métricas de todas las organizaciones.
    *   Panel de gestión de Organizaciones (Crear/Editar/Deshabilitar).
    *   Selector de Sucursal para "simular" acceso como admin de un gimnasio específico.
2.  **OrgAdmin**:
    *   Dashboard de sus sucursales.
    *   Gestión de sucursales de su propia organización.
3.  **BranchAdmin / Coach**:
    *   Vista actual del sistema limitada a su sucursal.

## 3. Control de Acceso a Módulos (Gating)

### Navegación Dinámica:
*   El componente de menú lateral (Sidenav) filtrará los items basándose en el array `modulesEnabled` obtenido del perfil de la Sucursal.
*   Ejemplo: Si la sucursal tiene plan "Básico", el botón "Rutinas" no se renderizará.

### Route Guards:
*   Se implementará un `ModuleGuard` en Angular que verifique las rutas configuradas.
*   Si el usuario intenta acceder a `/rutinas` y no está habilitado, se redirigirá a un panel de "Módulo no contratado".

## 4. Cambios en Servicios API
*   Se actualizará el `AuthInterceptor` para asegurar que el JWT incluya las claims necesarias.
*   Las URLs de las sucursales podrían seguir el patrón `/api/v1/:branchId/...` si se opta por esa vía, o simplemente delegar al backend vía JWT (Recomendado).

## 5. Roadmap de Tareas (Frontend)
1.  [ ] Auth: Actualizar login y manejo de JWT para capturar `orgId`/`branchId`.
2.  [ ] Store: Crear `TenantState` en NGXS.
3.  [ ] UI: Crear selector de sucursales para perfiles Admin/SuperAdmin.
4.  [ ] Gating: Implementar lógica de ocultación de menú por módulos.
5.  [ ] Routing: Crear Guard para proteger rutas de módulos deshabilitados.
6.  [ ] Admin: Crear panel de gestión de Organizaciones (solo SuperAdmin).
