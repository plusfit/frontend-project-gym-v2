# 🎯 **Guía: Configurar Permisos en Organización**

## 📍 **Ubicación de los Permisos**

Para configurar los permisos de reportes, navega a:
```
Organizaciones → [Seleccionar Organización] → Pestaña "Permisos"
```

## 📊 **Módulos Disponibles**

Ahora verás las siguientes secciones con sus respectivos permisos:

### **Reportes**
Sección llamada **"Reportes"** con los siguientes permisos:

### **Pantalla** 
Sección llamada **"Pantalla"** para gestionar las pantallas de visualización de rutinas:

### 🔍 **Permisos Disponibles**

| Permiso | Icono | Descripción | Funcionalidad |
|---------|-------|-------------|---------------|
| **Visualizar** | 👁️ | Ver dashboard y métricas básicas | • Dashboard principal<br>• Gráficos de ocupación<br>• Métricas de rutinas<br>• KPIs básicos |
| **Exportar** | 📥 | Descargar reportes en Excel | • Exportar datos a Excel<br>• Reportes personalizados<br>• Filtros de fecha |
| **Avanzado** | 🎯 | Acceder a métricas financieras y analytics avanzados | • Ingresos detallados<br>• Proyecciones<br>• ARR/MRR<br>• Métricas financieras |

### 📱 **Permisos del Módulo Pantalla**

| Permiso | Icono | Descripción | Funcionalidad |
|---------|-------|-------------|---------------|
| **Visualizar** | 📺 | Ver pantallas de rutinas | • Acceso a pantallas públicas<br>• Visualización de rutinas<br>• Modo pantalla completa |
| **Gestionar** | ⚙️ | Administrar pantallas y configuraciones | • Configurar contenido<br>• Gestionar rutinas mostradas<br>• Administrar pantallas |

## 👥 **Configuraciones Recomendadas por Rol**

### 🔴 **SuperAdmin (Completo)**
```
Reportes:
✅ Visualizar
✅ Exportar  
✅ Avanzado

Pantalla:
✅ Visualizar
✅ Gestionar
```
**Acceso:** Dashboard completo + Exportación + Métricas financieras + Gestión total de pantallas

### 🟡 **Admin de Gimnasio (Operacional)**
```
Reportes:
✅ Visualizar
✅ Exportar
❌ Avanzado

Pantalla:
✅ Visualizar
✅ Gestionar
```
**Acceso:** Dashboard completo + Exportación + Gestión de pantallas (sin datos financieros sensibles)

### 🟢 **Manager/Staff (Solo Lectura)**
```
Reportes:
✅ Visualizar
❌ Exportar
❌ Avanzado

Pantalla:
✅ Visualizar
❌ Gestionar
```
**Acceso:** Solo visualización de métricas operacionales y pantallas

### 🔵 **Cliente (Sin Acceso)**
```
Reportes:
❌ Visualizar
❌ Exportar
❌ Avanzado

Pantalla:
✅ Visualizar
❌ Gestionar
```
**Acceso:** Solo visualización de pantallas públicas (ningún acceso a reportes administrativos)

## 🔧 **Cómo Configurar**

### **Paso 1: Acceder a Permisos**
1. Ve a **Organizaciones**
2. Selecciona la organización
3. Haz clic en la pestaña **"Permisos"**

### **Paso 2: Localizar Módulo Reportes**
4. Busca la sección **"Reportes"** con icono 📊
5. Verás la descripción: *"Acceder a reportes y análisis de datos"*

### **Paso 3: Configurar Permisos**
6. **Checkbox individual**: Marca/desmarca permisos específicos
7. **Checkbox maestro**: Selecciona/deselecciona todos los permisos del módulo
8. **Guardar cambios**: Haz clic en "Guardar Cambios"

## 🎨 **Interfaz Visual**

```
┌─────────────────────────────────────────────────────┐
│ 📊 Reportes                              ☐ Todos    │
│ Acceder a reportes y análisis de datos              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────┐  ┌─────────────────────┐    │
│ │ 👁️ Visualizar       │  │ 📥 Exportar         │    │
│ │ Ver dashboard       │  │ Descargar reportes  │    │
│ │ ☑️ Habilitado       │  │ ☑️ Habilitado       │    │
│ └─────────────────────┘  └─────────────────────┘    │
│                                                     │
│ ┌─────────────────────┐                             │
│ │ 🎯 Avanzado         │                             │
│ │ Métricas financieras│                             │
│ │ ☐ Deshabilitado     │                             │
│ └─────────────────────┘                             │
└─────────────────────────────────────────────────────┘
```

## ⚡ **Efectos Inmediatos**

Una vez guardados los cambios:

### ✅ **Con Permisos de Visualizar**
- Aparece "Reportes" en el menú lateral
- Acceso al dashboard de métricas
- Visualización de gráficos

### ✅ **Con Permisos de Exportar** 
- Botón "Exportar" visible en dashboard
- Diálogo de exportación funcional
- Descarga de archivos Excel

### ✅ **Con Permisos Avanzados**
- Sección financiera visible
- Métricas de ingresos disponibles
- Analytics detallados

### ❌ **Sin Permisos**
- "Reportes" no aparece en navegación
- Error 403 al intentar acceder directamente
- Botones de exportación ocultos

## 🔄 **Testeo de Configuración**

### **Verificar Configuración:**
1. **Guardar** los permisos
2. **Hacer logout** del usuario
3. **Hacer login** nuevamente  
4. **Verificar** que el menú "Reportes" aparezca/desaparezca
5. **Probar** acceso a funcionalidades específicas

### **Troubleshooting:**
- **No aparece Reportes en menú**: Verificar permiso "Visualizar"
- **Botón Exportar oculto**: Verificar permiso "Exportar"  
- **Error 403**: Verificar que el usuario tenga los permisos asignados
- **Cambios no reflejan**: Hacer logout/login para refrescar permisos

## 📝 **Notas Importantes**

⚠️ **Precauciones:**
- Los cambios requieren **logout/login** para aplicarse
- Los permisos son **acumulativos** (Avanzado incluye Visualizar)
- Sin "Visualizar" no se puede acceder a ningún reporte

✅ **Mejores Prácticas:**
- Asignar permisos según responsabilidades reales
- Revisar permisos periódicamente
- Documentar cambios en permisos críticos
- Usar principio de menor privilegio

---

🎯 **¡Los permisos de reportes ya están disponibles en el detalle de organización!**
📊 **Configura según las necesidades de cada rol y organización** 